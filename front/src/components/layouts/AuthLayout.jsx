import { Outlet } from "react-router-dom";
import LangSwitcher from "@/components/ui_int/LangSwitcher"

export default function AuthLayout() {
  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="absolute top-[10px] left-[10px]">Transendance</div>
        <div className="absolute top-[10px] right-[10px]">
          <LangSwitcher />
        </div>
        <Outlet />
    </div>
  );
}