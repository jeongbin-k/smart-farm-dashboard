import Header from "../../components/Header";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useWebSocket } from "../../hooks/useWebSocket";
import { getPens } from "../../api/pen";
import { validatePensData } from "../../utils/validate";
import type { PensResponse, Pen } from "../../types";
import "./DashboardPage.css";

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

export default function DashboardPage() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // 데이터 상태
  const [data, setData] = useState<PensResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // UI 상태 (객체 펼침)
  const [expandedPens, setExpandedPens] = useState<Set<string>>(new Set());

  // 초기 데이터 로딩 (REST API)
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getPens(token);
        const validated = validatePensData(response);
        setData(validated);
        setError("");
      } catch (err) {
        // 401 에러면 로그인 페이지로!
        if (err instanceof Error && err.name === "UnauthorizedError") {
          console.error("Token expired, redirecting to login...");
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
  }, [token, t, logout, navigate]);

  // WebSocket 실시간 업데이트
  const handleWebSocketMessage = useCallback((message: unknown) => {
    try {
      const validated = validatePensData(message);
      setData(validated);
    } catch (err) {
      console.error("WebSocket data validation failed:", err);
    }
  }, []);

  const wsUrl = token ? `${WS_BASE_URL}/ws/pens?token=${token}` : null;

  const { isConnected } = useWebSocket(wsUrl, {
    onMessage: handleWebSocketMessage,
  });

  // 이상 개체 토글
  const toggleExpand = (penId: string) => {
    setExpandedPens((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(penId)) {
        newSet.delete(penId);
      } else {
        newSet.add(penId);
      }
      return newSet;
    });
  };

  // 상세 페이지로 이동 (pen_id에서 숫자만 추출)
  const goToDetail = (pen: Pen) => {
    // "room_001" → "1" 추출
    const penIdNumber = pen.pen_id.replace(/[^0-9]/g, "");
    navigate(`/detail/${penIdNumber}`);
  };

  const getPenName = (penName: string) => {
    if (i18n.language === "ko") {
      return penName;
    } else {
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
  if (error) {
    return (
      <div className="common_err">
        <div>{error}</div>
        <button onClick={() => window.location.reload()}>
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard_container">
      {/* 헤더 */}
      <Header isConnected={isConnected} />

      {/* 메인 컨텐츠 */}
      <main className="dashboard_main">
        {!data || data.piggeies.length === 0 ? (
          <div className="no_data">{t("dashboard.noData")}</div>
        ) : (
          data.piggeies.map((piggery) => (
            <div key={piggery.piggery_id} style={{ marginBottom: "30px" }}>
              {/* 농장 헤더 */}
              <div className="farm_header">
                <h2>
                  {t("dashboard.farm")}
                  {/* {piggery.piggery_name} */}
                </h2>
                <p>
                  {t("dashboard.stock")}: {piggery.total_pigs}
                  {t("dashboard.unit")}
                </p>
              </div>

              {/* 돈사 리스트 */}
              {piggery.pens.map((pen) => (
                <div key={pen.pen_id} className="penlist_content">
                  {/* 돈사 정보 */}
                  <div className="penlist_top">
                    <div>
                      <h3>{getPenName(pen.pen_name)}</h3>
                      {pen.abnormal_pigs.length > 0 && (
                        <span>{pen.abnormal_pigs.length}</span>
                      )}
                    </div>
                    <button onClick={() => goToDetail(pen)}>
                      {t("detail.title")}
                    </button>
                  </div>

                  {/* 돈사 통계 */}
                  <div className="penlist_stats">
                    <div className="stats_content">
                      <div>{t("dashboard.stock")}</div>
                      <div>
                        {pen.current_pig_count}
                        {t("dashboard.unit")}
                      </div>
                    </div>
                    <div className="stats_content">
                      <div>{t("dashboard.activity")}</div>
                      <div>{pen.avg_activity_level.toFixed(1)}</div>
                    </div>
                    <div className="stats_content">
                      <div>{t("dashboard.feedingTime")}</div>
                      <div>{pen.avg_feeding_time_minutes.toFixed(1)}분</div>
                    </div>
                    <div className="stats_content">
                      <div>{t("dashboard.temperature")}</div>
                      <div>{pen.avg_temperature_celsius.toFixed(1)}°C</div>
                    </div>
                  </div>

                  {/* 이상 개체 리스트 */}
                  {pen.abnormal_pigs.length > 0 && (
                    <div className="toggle_content">
                      <button onClick={() => toggleExpand(pen.pen_id)}>
                        {expandedPens.has(pen.pen_id) ? "▼" : "▶"}{" "}
                        {t("dashboard.abnormalList")} (
                        {pen.abnormal_pigs.length})
                      </button>

                      {expandedPens.has(pen.pen_id) && (
                        <div
                          style={{
                            marginTop: "10px",
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(200px, 1fr))",
                            gap: "10px",
                          }}
                        >
                          {pen.abnormal_pigs.map((pig) => (
                            <div className="penid_container" key={pig.wid}>
                              {pig.thumbnail_url && (
                                <img
                                  src={pig.thumbnail_url}
                                  alt={`Pig ${pig.wid}`}
                                />
                              )}
                              <div className="penid_content">
                                <div className="pen_id">ID: {pig.wid}</div>
                                <div>
                                  {t("dashboard.activity")}: {pig.activity}
                                </div>
                                <div>
                                  {t("dashboard.feedingTime")}:{" "}
                                  {pig.feeding_time}
                                  {t("dashboard.min")}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
