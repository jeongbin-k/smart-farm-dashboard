import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import iconKo from "../assets/icon-ko.png";
import iconEn from "../assets/icon-en.png";

interface HeaderProps {
  isConnected: boolean;
}

export default function Header({ isConnected }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="dash_header">
      <div className="header_content">
        {/* WebSocket 연결 상태 */}
        <div className="ws_content">
          <div
            className={`ws_live_indicator ${isConnected ? "is-connected" : "is-disconnected"}`}
          />
          <span>{isConnected ? "Live" : "Disconnected"}</span>
        </div>
        <h1>{t("dashboard.title")}</h1>
        {/* 언어 변경, 로그아웃 */}
        <div className="header_right">
          <div className="language_select_content">
            <img
              src={i18n.language === "ko" ? iconKo : iconEn}
              alt="flag"
              className="flag_icon"
            />
            <select
              className="language_select"
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
            >
              <option value="ko">KOR</option>
              <option value="en">EN</option>
            </select>
          </div>
          <button onClick={handleLogout} className="logout_btn">
            {t("common.logout")}
          </button>
        </div>
      </div>
    </header>
  );
}
