import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RedirectToDjangoAdmin from "./components/util/RedirectToDjangoAdmin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RestorePassword from "./pages/RestorePassword";
import EditProfile from "./pages/EditProfile";
import EditFriends from "./pages/EditFriends";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import OAuth from "./pages/OAuth";
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
          <Route path="/restore" element={<RestorePassword />} />
          <Route path="/oauth" element={<OAuth />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* <Route path="/profile" element={<Profile />} /> */}
            <Route path="/editprofile" element={<EditProfile />} />
            <Route path="/editfriends" element={<EditFriends />} />
            <Route path="/" element={<Index />} />
          </Route>
        </Route>
        <Route path="/admin" element={<RedirectToDjangoAdmin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
