import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify'
import API from "../api/api";
import { getErrorMessage } from "../utils/errors";
import Input from "../components/ui_int/Input";
import Button from "../components/ui_int/Button";
import { Spinner } from "../components/ui/Spinner";
import OtpDialog from "../components/login/OtpDialog";
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from "@/stores/settingsStore";

export default function Login() {
    const { getServerHttpUrl } = useSettingsStore();
    const { t, i18n } = useTranslation();
    const [form, setForm] = useState({ username: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [login42Clicked, setLogin42Clicked] = useState(false);
    const [openOtpDialog, setOpenOtpDialog] = useState(false);
    const [tmpUserId, setTmpUserId] = useState(null);
    const navigate = useNavigate()


    async function changeForm(field) {
        setErrors({})
        setForm({ ...form, ...field })
    }


    async function onCodeEntered(code) {
        try {
            const res = await API.post("/auth/verify-otp/", {
                user_id: tmpUserId,
                code
            })
            setOpenOtpDialog(false);
            localStorage.setItem("token", res.data.access);
            navigate("/")
        } catch (err) {
            return err.response.data.error || t("login.error_occurred");
        }
    }


    const onSubmit = async (e) => {
        e.preventDefault();
        setErrors("");
        setLoading(true);

        try {
            const res = await API.post("auth/login/", form);
            if (res.data.requires_2fa) {
                setTmpUserId(res.data.user_id);
                setOpenOtpDialog(true);
            }
            else {
                localStorage.setItem("token", res.data.access);
                navigate("/")
            }
        } catch (err) {
            setErrors(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };


    function onLogin42() {
        setLogin42Clicked(true);
        window.location = getServerHttpUrl() + '/api/auth/e42/'
    }


    return (
        <div className="flex h-screen items-center justify-center">
                <form
                    onSubmit={onSubmit}
                    className="bg-white p-6 rounded-2xl shadow-md w-100"
                >
                    <h2 className="text-xl font-bold mb-4 text-center">{t('login.title')}</h2>
                    <Input
                        placeholder={t('login.username')}
                        value={form.username}
                        onChange={(e) => changeForm({ username: e.target.value })}
                    />
                    <div className="error-message">{errors.username}</div>
                    <Input
                        type="password"
                        placeholder={t('login.password')}
                        value={form.password}
                        onChange={(e) => changeForm({ password: e.target.value })}
                    />
                    <div className="error-message">{errors.password}</div>
                    <div className="error-message text-center">{errors.common}</div>
                    <Button loading={loading} className="w-full">
                        {t('login.title')}
                    </Button>
                    <a href={`${getServerHttpUrl()}/api/auth/google/`} className="simple-link block text-center mt-3 text-sm">
                        {t('login.login_with_google')}
                    </a>
                    <a className="simple-link text-sm block text-center" onClick={onLogin42}>
                        {login42Clicked ? <span>{t('login.redirecting_to_42')} <Spinner className="inline mb-1" /></span> : t("login.login_with_42")}
                    </a>

                    <Link to="/register" className="simple-link text-sm block text-center mt-6"> {t('login.dont_have_account')} </Link>
                    <Link to="/restore" className="simple-link text-sm block text-center"> {t('login.forget_password')} </Link>
                </form>
            <OtpDialog
                open={openOtpDialog} setOpen={setOpenOtpDialog}
                onSuccess={(code) => onCodeEntered(code)}
            />

        </div>
    );
}
