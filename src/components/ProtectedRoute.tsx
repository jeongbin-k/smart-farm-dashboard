import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  // 로그인이 안 되어있으면 로그인 페이지로 강제 이동
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 로그인이 되어있으면 원래 페이지 보여주기
  return <Outlet />;
}
