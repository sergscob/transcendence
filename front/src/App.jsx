import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RedirectToDjangoAdmin from "./components/util/RedirectToDjangoAdmin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Index from "./pages/Index";

import AuthLayout from "./components/layouts/AuthLayout";
import MainLayout from "./components/layouts/MainLayout";
import ProtectedRoute from "./components/util/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Index />} />
          </Route>
        </Route>
        <Route path="/admin" element={<RedirectToDjangoAdmin />} />
      </Routes>
    </Router>
  );
}
