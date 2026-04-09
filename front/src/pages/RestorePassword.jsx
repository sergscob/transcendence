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
    <div className="flex h-screen items-center justify-center bg-gray-100">
			<form
				onSubmit={handleSubmit}
				className="bg-white p-6 rounded-2xl shadow-md w-100"
			>
				<h2 className="text-xl font-bold mb-4 text-center">{t("restore_password.title")}</h2>
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
					/>
					<div className="error-message text-center mt-2">{errors.common}</div>
					<Button className="mt-2" loading={loading}>{t("restore_password.send_link")}</Button>
					<div className="text-sm mt-6 text-center">{t("restore_password.have_account")} <a className="simple-link" href="/login">{t("restore_password.login_here")}</a></div>
					<div className="text-sm text-center">{t("restore_password.no_account")} <a className="simple-link" href="/register">{t("restore_password.register_here")}</a></div>
				</>
				}
			</form>
		</div>
  );
}

export default RestorePassword;
