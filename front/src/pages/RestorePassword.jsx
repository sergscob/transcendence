import { useState } from "react";
import { useNavigate } from "react-router";
import API from "../api/api";
import { getErrorMessage } from "../utils/errors";
import Input from "../components/ui_int/Input";
import Button from "../components/ui_int/Button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


function RestorePassword() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [succeded, setSucceded] = useState(false);

  async function changeForm(field) {
    setErrors({})
    setForm({...form, ...field})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await API.post("auth/request-reset/", form)
      setSucceded(true)
    } catch (err) {
      setErrors(getErrorMessage(err))
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
			<form
				onSubmit={handleSubmit}
				className="bg-gray-500 p-6 rounded-2xl shadow-md _w-120"
			>
				<h2 className="text-[25px] mb-4 text-center">{t("restore_password.title")}</h2>
				{ succeded ?
				<>
				<h3 className="text-l mb-4 text-center">{t("restore_password.reset_link_sent")}</h3>
				<Link to="/login" className="text-center text-sm mt-6 block"> {t("restore_password.login")}</Link>
				</>
				:
				<>
					<Input
						value={form.email}
						onChange={e => changeForm({ email: e.target.value })}
						placeholder={t("restore_password.email")}
						className="_placeholder:text-white border-gray-300 text-white"
					/>
					<div className="error-message text-center mt-2">{errors.common}</div>
					<Button className="mt-2 w-full" loading={loading} disabled={!form.email}>{t("restore_password.send_link")}</Button>
					<div className="text-sm mt-6 text-center _text-white">
						{t("restore_password.have_account")}
						<Link className="text-blue-800 ml-2" to="/login">{t("restore_password.login_here")}</Link>
					</div>
					<div className="text-sm text-center _text-white">
						{t("restore_password.no_account")}
						<Link className="text-blue-800 ml-2" to="/register">{t("restore_password.register_here")}</Link>
					</div>
				</>
				}
			</form>
		</div>
  );
}

export default RestorePassword;
