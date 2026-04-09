import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

import RedirectToDjangoAdmin from "./components/util/RedirectToDjangoAdmin";
import AuthLayout from "./components/layouts/AuthLayout";
import MainLayout from "./components/layouts/MainLayout";
import ProtectedRoute from "./components/util/ProtectedRoute";
import GameLayout from "./components/layouts/GameLayout";

import OAuth from "./pages/OAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RestorePassword from "./pages/RestorePassword";
import EditProfile from "./pages/EditProfile";
import EditFriends from "./pages/EditFriends";
import Index from "./pages/Index";
import ViewProfile from "./pages/VIewProfile";
import NotFound from "./pages/NotFound";
import GameMain from "./pages/GameMain";
import Settings from "./pages/Settings";
import OpenMatches from "./pages/OpenMatches";
import TotalStat from "./pages/TotalStat";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/restore" element={<RestorePassword />} />
          <Route path="/oauth" element={<OAuth />} />
          <Route path="/settings-start" element={<Settings />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/profile/:id" element={<ViewProfile />} />
            <Route path="/editprofile" element={<EditProfile />} />
            <Route path="/editfriends" element={<EditFriends />} />
            <Route path="/stats" element={<TotalStat />} />
            <Route path="/matches" element={<OpenMatches />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Index />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<GameLayout />}>
            <Route path="/game/" element={<GameMain />} />
            <Route path="/game/:id" element={<GameMain />} />
          </Route>
        </Route>
        <Route path="/admin" element={<RedirectToDjangoAdmin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer 
        position="top-right"    
      />
    </Router>
  );
}
