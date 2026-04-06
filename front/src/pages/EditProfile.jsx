import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import { useUserStore } from "@/stores/userStore";
import { IMAGES_DIR } from "/config";
import Input from "../components/ui_int/Input";
import Loading from "../components/ui_int/Loading";
import NotFound from "./NotFound";
import OtpDialog from "../components/pages/login/OtpDialog";
import { useTranslation } from "react-i18next";

function EditProfile() {
  const { t } = useTranslation();
  const loadUser = useUserStore((s) => s.loadUser);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);
  const loading = useUserStore((s) => s.loading);
  const loaded = useUserStore((s) => s.loaded);
  const fileInputRef = useRef();
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [qrcode, setQrcode] = useState("");

  async function onCheck2fa(e) {
    e.preventDefault();
    user.is_2fa_enabled = e.target.checked;
    // console.log("user after change", user);
    if (user.is_2fa_enabled) 
    {
      try {
        const res = await API.post("/auth/enable-2fa/") 
        console.log("formData in EditProfile.jsx", res.data);  
        setQrcode(res.data.qr);
        setOpenOtpDialog(true);
      } catch (err) {
        console.error(err);  
      }
    }
    else 
    {
      try {
        const res = await API.patch("profile/update/", { 
          id: user.id, 
          is_2fa_enabled: false 
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);  
      }
    }
  }

  async function onCodeEntered(code) {
    try {
      await API.post("/auth/confirm-2fa/", { code });
      setOpenOtpDialog(false);
    } catch (err) {
      return err.response.data.error;
    }
  }


  useEffect(() => {
    if (loaded && user) {
      console.log("User loaded in Profile.jsx", user);
    }
  }, [user]);

  useEffect(() => {
    if (!openOtpDialog) {
      console.log("openOtpDialog changed", openOtpDialog);
      loadUser(true);
    }
  }, [openOtpDialog]);

  async function uploadAvatar(e) {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await API.patch("profile/update/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      loadUser(true);
      fileInputRef.current.value = "";
    } catch (err) {
      alert(t("edit_profile.upload_avatar_failed"));
    }
  }

  if (loading) return <Loading />;
  if (!user) return <NotFound text={t("edit_profile.server_connection_error")} code={t("edit_profile.error_code")} />;

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <div>
        <div>{user.username}</div>
        {user.avatar && (
            <img src={IMAGES_DIR+user.avatar} className="w-15 h-15 rounded-full" />
        )}
        <input type="checkbox" checked={user.is_2fa_enabled} onChange={onCheck2fa} /> {t("edit_profile.two_factor_authentication")}
        <form onSubmit={uploadAvatar} className="ma-4 border-2 p-4 rounded">
          <input type="file" accept="image/*" ref={fileInputRef} />
          <button type="submit">{t("edit_profile.upload_avatar")}</button>
        </form>
        <OtpDialog 
            open={openOtpDialog} setOpen={setOpenOtpDialog} 
            qrcode={qrcode}
            onSuccess={(code) => onCodeEntered(code)}
        />
      </div>
    </div>
  );
}

export default EditProfile;