import { createContext, useState, type ReactNode } from "react";

// 1. Context에 담을 데이터 타입 정의
interface AuthContextType {
  token: string | null; // JWT 토큰
  login: (token: string) => void; // 로그인 함수
  logout: () => void; // 로그아웃 함수
  isAuthenticated: boolean; // 로그인 여부
}

// 2. AuthContext 생성
export const AuthContext = createContext<AuthContextType | null>(null);

// 3. provider 구현
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token"),
  );

  // 로그인 함수
  const login = (newToken: string) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}
