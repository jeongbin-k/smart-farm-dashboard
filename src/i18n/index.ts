import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ko from "./ko";
import en from "./en";

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: localStorage.getItem("language") || "ko", // 초기 언어 설정
  fallbackLng: "ko",
  interpolation: {
    escapeValue: false, // 리액트는 기본적으로 XSS 방지 -> false로 설정
  },
});

// 언어가 바뀔 때마다 브라우저에 저장 (새로고침해도 유지)
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
});

export default i18n;
