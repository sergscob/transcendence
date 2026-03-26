import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router";


export default function AuthLayout() {
  const navigate = useNavigate()

  function onLogout() {
    localStorage.setItem("token", '')
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-2 right-2 cursor-pointer" onClick={()=>onLogout()}>Logout</div>
      <Outlet />
    </div>
  );
}