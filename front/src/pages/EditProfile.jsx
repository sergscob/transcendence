import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import API from "../api/api";
import { useUserStore } from "@/stores/userStore";
import { IMAGES_DIR } from "/config";
import Input from "../components/ui_int/Input";
import Button from "../components/ui_int/Button";
import Avatar from "../components/ui_int/Avatar";
import Loading from "../components/ui_int/Loading";
import NotFound from "./NotFound";
import OtpDialog from "../components/login/OtpDialog";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify'
import AddFileIcon from "../assets/icons/addFile.svg?react";
import FileUploadedIcon from "../assets/icons/fileUploaded.svg?react";
import UploadIcon from "../assets/icons/upload.svg?react"
import MissFileIcon from "../assets/icons/missingFile.svg?react"
import ButtonClose from "@/components/ui_int/ButtonClose";

function EditProfile() {
  const { t } = useTranslation();
  const loadUser = useUserStore((s) => s.loadUser);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);
  const loading = useUserStore((s) => s.loading);
  const loaded = useUserStore((s) => s.loaded);
  const fileInputRef = useRef();
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [qrcode, setQrcode] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const navigate = useNavigate();

  async function onCheck2fa(e) {
    e.preventDefault();
    user.is_2fa_enabled = e.target.checked;
    // console.log("user after change", user);
    if (user.is_2fa_enabled) {
      try {
        const res = await API.post("/auth/enable-2fa/")
        console.log("formData in EditProfile.jsx", res.data);
        setQrcode(res.data.qr);
        setOpenOtpDialog(true);
      } catch (err) {
        console.error(err);
        toast.error(t("edit_profile.enable_2fa_failed"));
      }
    }
    else {
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
    if (!openOtpDialog) {
      loadUser(true);
    }
  }, [openOtpDialog, loadUser]);

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
      setUsernameError("");
    }
  }, [user?.username]);

  async function onSave(e) {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    if (file)
      formData.append("avatar", file);
    formData.append("username", username);

    try {
      const res = await API.patch("profile/update/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      loadUser(true);
      fileInputRef.current.value = "";
      setSelectedFileName("");
      setUsernameError("");
      toast.success(t("edit_profile.profile_updated"));
    } catch (e) {
      console.log("Error uploading avatar:");
      const err = e.response?.data;
      const usernameMessage = Array.isArray(err?.username) ? err.username[0] : err?.username;
      setUsernameError(usernameMessage || "");
      toast.error( err?.error || err?.detail || err?.avatar?.join?.() || usernameMessage || t("edit_profile.upload_avatar_failed"));
    }
  }

  if (loading) return <Loading />;
  if (!user) return <NotFound text={t("edit_profile.server_connection_error")} code={t("edit_profile.error_code")} />;

  const hasSelectedFile = Boolean(fileInputRef.current?.files?.[0]);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col rounded-lg p-6 shadow-lg bg-gray-500 relative w-150 max-w-full" >
        <ButtonClose onClose={() => navigate(-1)} className="absolute top-4 right-4" />
        <div className="text-lg text-[24px] text-white text-center mb">{t("edit_profile.edit_profile")}</div>
        <div className="flex flex-col items-center gap-4">
          <Avatar user={user} size="120" />
          <div className="text-[20px] font-bold text-white">{user.username}</div>
        </div>
        <div className="flex flex-col items-left gap-2 mt-4">
          <div>
            <label className="flex items-center gap-2 text-lg text-white mt-3">
              <input type="checkbox" checked={user.is_2fa_enabled} onChange={onCheck2fa} className="size-5 cursor-pointer" />
              {t("edit_profile.ask_two_factor_authentication")}
            </label>
            <form onSubmit={onSave} className="ma-4 border text-white border-white p-4 rounded mt-2">
              { t("edit_profile.user_name") }:
              <Input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameError) setUsernameError("");
                }}
                className={`mt-1 ${usernameError ? "border-red-400 focus:ring-red-400" : ""}`}
              />
              <label className="cursor-pointer block group bg-black text-white py-2 px-6 rounded-lg mt-4 w-66 text-center">
                <span className="text-lg text-white">{t("edit_profile.ask_upload_avatar")}</span>
                <AddFileIcon className="inline ml-2 w-7 h-7 stroke-white hover:scale-110 transition-transform" />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || "")}
                />
              </label>
                {selectedFileName && (
                  <div className="ml-2 text-white">{selectedFileName}</div>
                )}
              <Button type="submit" className="mt-4" disabled={username === user.username && !hasSelectedFile}>
                { t('settings.save')}
              </Button>
            </form>
            <OtpDialog
              open={openOtpDialog} setOpen={setOpenOtpDialog}
              qrcode={qrcode}
              onSuccess={(code) => onCodeEntered(code)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
