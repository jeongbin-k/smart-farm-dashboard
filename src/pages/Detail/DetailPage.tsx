import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useWebSocket } from "../../hooks/useWebSocket";
import { getPenDetail } from "../../api/pen";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PenDetail, WsTimeSeriesMessage } from "../../types";
import Header from "../../components/Header";
import "./DetailPage.css";

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

interface ChartDataPoint {
  index: number;
  activity: number;
  feeding_time: number;
}

export default function DetailPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { penId } = useParams<{ penId: string }>();
  const { token, logout } = useAuth();

  // 데이터 상태
  const [penDetail, setPenDetail] = useState<PenDetail | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 초기 데이터 로딩 (REST API)
  useEffect(() => {
    if (!token || !penId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getPenDetail(token, parseInt(penId));
        setPenDetail(response);

        // 초기 차트 데이터 (최근 10개)
        const initialData = response.time_series.map((point, index) => ({
          index: index + 1,
          activity: point.activity,
          feeding_time: point.feeding_time,
        }));
        setChartData(initialData);
        setError("");
      } catch (err) {
        if (err instanceof Error && err.name === "UnauthorizedError") {
          logout();
          navigate("/login");
        } else {
          setError(t("common.error"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, penId, t, logout, navigate]);

  // WebSocket 실시간 데이터 추가
  const handleWebSocketMessage = useCallback((message: unknown) => {
    try {
      const wsMessage = message as WsTimeSeriesMessage;

      // 새 데이터 포인트 추가
      setChartData((prev) => {
        const newPoint: ChartDataPoint = {
          index: prev.length + 1,
          activity: wsMessage.data.activity,
          feeding_time: wsMessage.data.feeding_time,
        };

        // 최대 50개까지만 유지 (너무 많으면 그래프가 복잡해짐)
        const updated = [...prev, newPoint];
        return updated.slice(-50);
      });
    } catch (err) {
      console.error("Failed to process WebSocket message:", err);
    }
  }, []);

  const wsUrl =
    token && penId ? `${WS_BASE_URL}/ws/pens/${penId}?token=${token}` : null;

  const { isConnected } = useWebSocket(wsUrl, {
    onMessage: handleWebSocketMessage,
    onAuthError: () => {
      logout();
      navigate("/login");
    },
  });

  const getPenName = (penName: string) => {
    if (i18n.language === "ko") {
      return penName;
    } else {
      // "돈방 1" -> "Pen 1"로 교체
      return penName.replace("돈방", "Pen");
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="common_loding">
        <div>{t("common.loading")}</div>
      </div>
    );
  }

  // 에러
  if (error || !penDetail) {
    return (
      <div className="common_err">
        <div>{error || t("dashboard.noData")}</div>
        <button onClick={() => navigate("/dashboard")}>
          {t("detail.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="detail_container">
      {/* 헤더 */}
      <Header isConnected={isConnected} />
      {/* 메인 컨텐츠 */}
      <main className="detail_main">
        {/* 상단 정보 */}
        <div className="detail_top">
          <div>
            <h1>{getPenName(penDetail.name)}</h1>
            <p>
              {t("detail.title")} -{" "}
              {t("detail.dataPoints", { count: chartData.length })}
            </p>
          </div>

          <button onClick={() => navigate("/dashboard")}>
            ← {t("detail.back")}
          </button>
        </div>

        {/* 그래프 */}
        <div className="detail_graph">
          <h2>{t("detail.monitoringTitle")}</h2>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="index"
                label={{
                  value: t("detail.time"),
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: t("detail.activity"),
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: t("detail.feedingTime"),
                  angle: 90,
                  position: "insideRight",
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="activity"
                stroke="#3b82f6"
                name={t("detail.activity")}
                dot={false}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="feeding_time"
                stroke="#ef4444"
                name={t("detail.feedingTime")}
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* 범례 설명 */}
          <div className="dl_container">
            <div className="dl_content">
              <div>
                <div className="dl_l" />
                <span>
                  {t("detail.activity")}: {t("detail.aCaption")}
                </span>
              </div>
              <div>
                <div className="dl_r" />
                <span>
                  {t("detail.feedingTime")}: {t("detail.fCaption")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
