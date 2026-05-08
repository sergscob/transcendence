import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../../utils/auth";

export default function ProtectedRoute() {
  const isAuth = Boolean(getToken());
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}
