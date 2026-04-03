import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import { useUserStore } from "@/stores/userStore";
import { IMAGES_DIR } from "/config";
import Input from "../components/ui_int/Input";
import OtpDialog from "../components/pages/login/OtpDialog";

function EditProfile() {
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
      alert("Failed to upload avatar");
    }
  }

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div>
      <div>{user.username}</div>
      {user.avatar && (
          <img src={IMAGES_DIR+user.avatar} className="w-15 h-15 rounded-full" />
      )}
      <input type="checkbox" checked={user.is_2fa_enabled} onChange={onCheck2fa} /> Two Factor Authentication
      <form onSubmit={uploadAvatar} className="ma-4 border-2 p-4 rounded">
        <input type="file" accept="image/*" ref={fileInputRef} />
        <button type="submit">Upload Avatar</button>
      </form>
      <OtpDialog 
          open={openOtpDialog} setOpen={setOpenOtpDialog} 
          qrcode={qrcode}
          onSuccess={(code) => onCodeEntered(code)}
       />
    </div>
  );
}

export default EditProfile;