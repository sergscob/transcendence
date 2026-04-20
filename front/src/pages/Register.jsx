import { useState } from "react";
import { Link, useNavigate } from "react-router";
import API from "../api/api";
import { getErrorMessage } from "../utils/errors";
import Input from "../components/ui_int/Input";
import Button from "../components/ui_int/Button";
import { useTranslation } from "react-i18next";


function Register() {
	const { t } = useTranslation();
	const [form, setForm] = useState({ username: "", email: "", password: "" });
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [registered, setRegistered] = useState(false);
	const navigate = useNavigate()

	async function changeForm(field) {
		setErrors({})
		setForm({ ...form, ...field })
	}

	async function handleSubmit(e) {
		e.preventDefault()
		setErrors({})
		setLoading(true)
		try {
			await API.post("auth/register/", form)
			setRegistered(true)
		} catch (err) {
			setErrors(getErrorMessage(err))
		} finally {
			setLoading(false);
		}
	};

	function toLogin() {
		navigate("/login")
	}

	return (
		<div className="flex h-screen items-center justify-center">
				{registered ?
					<div className="bg-gray-500 p-6 rounded-2xl shadow-md w-100 text-center">
						<h3 className="text-l text-white mb-4 text-center">{t("register.registration_succeeded")}</h3>
						<Button onClick={toLogin}>{t("register.go_to_login")}</Button>
					</div>
					:
					<form
						onSubmit={handleSubmit}
						className="bg-gray-500 p-6 rounded-2xl shadow-md w-100"
					>
						<h2 className="text-[30px] text-white mb-4 text-center">{t("register.title")}</h2>
						<Input
							value={form.username}
							onChange={e => changeForm({ username: e.target.value })}
							placeholder={t("register.username")}
							className="placeholder:text-white border-gray-300 text-white"
						/>
						<div className="error-message">{errors.username}</div>

						<Input
							value={form.email}
							onChange={e => changeForm({ email: e.target.value })}
							placeholder={t("register.email")}
							className="placeholder:text-white border-gray-300 text-white"
						/>
						<div className="error-message">{errors.email}</div>

						<Input
							type="password"
							value={form.password}
							onChange={e => changeForm({ password: e.target.value })}
							placeholder={t("register.password")}
							className="placeholder:text-white border-gray-300 text-white"
						/>
						<div className="error-message">{errors.password}</div>
						<div className="error-message">{errors.common}</div>
						<Button className="w-full" loading={loading}>{t("register.title")}</Button>
						<div className="text-sm mt-6 text-center text-white">{t("register.have_account")}
							<Link className="text-blue-800 ml-2" to="/login">{t("register.login_here")}</Link>
						</div>

					</form>
				}
		</div>
	);
}

export default Register;
