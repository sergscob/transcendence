import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import { useUserStore } from "@/stores/userStore";
import { IMAGES_DIR } from "/config";
import Input from "../components/ui_int/Input";
import Loading from "../components/ui_int/Loading";
import NotFound from "./NotFound";
import OtpDialog from "../components/login/OtpDialog";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify'
import AddFileIcon from "../assets/icons/addFile.svg?react";
import FileUploadedIcon from "../assets/icons/fileUploaded.svg?react";
import UploadIcon from "../assets/icons/upload.svg?react"
import MissFileIcon from "../assets/icons/missingFile.svg?react"

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
        toast.error(t("edit_profile.enable_2fa_failed"));
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
      // alert(t("edit_profile.upload_avatar_failed"));
      console.log("Error uploading avatar:" );
      toast.error(err.response?.data?.error || err.response?.data?.avatar.join() || t("edit_profile.upload_avatar_failed"));
    }
  }

  if (loading) return <Loading />;
  if (!user) return <NotFound text={t("edit_profile.server_connection_error")} code={t("edit_profile.error_code")} />;

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col border border-black rounded-lg p-10 shadow-lg bg-gray-500">
		<div className="text-lg text-[40px] text-white text-center">{t("edit_profile.edit_profile")}</div>
		<div className="flex flex-col items-center gap-4">
			{user.avatar && (
				<img src={IMAGES_DIR+user.avatar} className="w-70 h-70 rounded-full" />
			)}
			<div className="text-[30px] font-bold text-white">{user.username}</div>
		</div>
		<div className="flex flex-col items-left gap-2 mt-4">
			<label className="flex items-center gap-2 text-lg text-[20px] text-white">
				<input type="checkbox" checked={user.is_2fa_enabled} onChange={onCheck2fa} className="size-5 cursor-pointer"/>
				{t("edit_profile.ask_two_factor_authentication")}
			</label>
			<div>
				<div className="text-lg text-[20px] text-white">{t("edit_profile.ask_upload_avatar")}</div>
				<form onSubmit={uploadAvatar} className="flex items-center justify-between ma-4 border-2 p-4 rounded bg-white mt-2">
					<label className="cursor-pointer group">
						<AddFileIcon className="w-10 h-10 stroke-green-400 fill-white hover:scale-110 transition-transform" />
						<input type="file" accept="image/*" ref={fileInputRef} className="hidden" />
					</label>
					<button type="submit" title={t("edit_profile.upload_avatar")} className="hover:scale-110 transition-transform cursor-pointer">
						<UploadIcon className="w-8 h-8 fill-black" />
					</button>
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
