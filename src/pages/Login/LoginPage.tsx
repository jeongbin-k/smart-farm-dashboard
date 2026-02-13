import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { login } from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";
import "./LoginPage.css";
import Logo from "../../assets/intflow_logo.svg";
import IconKo from "../../assets/icon-ko.png";
import IconEn from "../../assets/icon-en.png";

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login: setAuthToken } = useAuth();

  // 폼 입력 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 언어 변경 함수
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  // 로그인 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //(페이지 새로고침 방지)
    setError(""); // 에러 초기화
    // 유효성 검사
    if (!email) {
      setError(t("login.error_email"));
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setError(t("login.error_password"));
      pwRef.current?.focus();
      return;
    }

    setIsLoading(true);
    try {
      // API 호출
      const response = await login(email, password);

      // 토큰 저장 (AuthContext)
      setAuthToken(response.access_token);

      // 대시보드로 이동
      navigate("/dashboard");
    } catch {
      setError(t("login.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login_container">
      <div className="login_content">
        {/* 헤더 */}
        <header className="header">
          <img src={Logo} alt="intflow_logo" className="logo_icon" />
          <div className="header_title">
            <h1>{t("login.welcome")}</h1>
            <p>{t("login.subtitle")}</p>
          </div>
          {/* 언어 선택 버튼 */}
          <div className="haeder_language">
            <button
              onClick={() => changeLanguage("ko")}
              className={`lang-btn ${i18n.language === "ko" ? "active" : ""}`}
            >
              <img src={IconKo} alt="icon-ko" /> 한국어
            </button>
            <button
              onClick={() => changeLanguage("en")}
              className={`lang-btn ${i18n.language === "en" ? "active" : ""}`}
            >
              <img src={IconEn} alt="icon-en" /> English
            </button>
          </div>
        </header>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 이메일 입력 */}
          <div className="input_content id_input">
            <label>{t("login.email")}</label>
            <input
              type="email"
              value={email}
              ref={emailRef}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailplace")}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="input_content pw_input">
            <label>{t("login.password")}</label>
            <input
              type="password"
              value={password}
              ref={pwRef}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* 에러 메시지 */}
          {error && <div className="err_msg">{error}</div>}

          {/* 로그인 버튼 */}
          <button type="submit" disabled={isLoading} className="login_btn">
            {isLoading ? t("common.loading") : t("login.button")}
          </button>
        </form>
      </div>
    </div>
  );
}
