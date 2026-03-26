import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="absolute top-[10px] left-[10px]">Transendance</div>
      <Outlet />
    </div>
  );
}