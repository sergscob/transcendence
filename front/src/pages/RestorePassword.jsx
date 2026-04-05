import { useState } from "react";
import { useNavigate } from "react-router";
import API from "../api/api";
import { getErrorMessage } from "../utils/errors";
import Input from "../components/ui_int/Input";
import Button from "../components/ui_int/Button";
import { Link } from "react-router-dom";


function RestorePassword() {
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
        <h2 className="text-xl font-bold mb-4 text-center">Request Password Reset</h2>
        { succeded ? 
          <>
          <h3 className="text-l mb-4 text-center">If email exists, reset link sent</h3>
          <Link to="/login" className="text-center text-sm mt-6 block"> Login </Link>
          </>
          :
          <>
            <Input
                value={form.email}
                onChange={e => changeForm({ email: e.target.value })}
                placeholder="Email"
            />
            <div className="error-message text-center mt-2">{errors.common}</div>
            <Button className="mt-2" loading={loading}>Send link</Button>
            <div className="text-sm mt-6 text-center">You have an account ? <a className="simple-link" href="/login">Login here</a></div>
            <div className="text-sm text-center">You don't have an account ? <a className="simple-link" href="/register">Register here</a></div>
          </>
        }
      </form>
    </div>
  );
}

export default RestorePassword;