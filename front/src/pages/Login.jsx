import { useState } from "react";
import { useNavigate } from "react-router";
import API from "../api/api";
import { getErrorMessage } from "../utils/errors";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";


export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  async function changeForm(field) {
    setErrors({})
    setForm({...form, ...field})
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    setLoading(true);

    try {
      const res = await API.post("login/", form);
      localStorage.setItem("token", res.data.access);
      navigate("/")
    } catch (err) {
      setErrors(getErrorMessage(err));
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
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
        <Input
          placeholder="Username"
          value={form.username}
          onChange={(e) => changeForm({ username: e.target.value })}
        />
        <div className="error-message">{errors.username}</div>
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => changeForm({ password: e.target.value })}
        />
        <div className="error-message">{errors.password}</div>
        <div className="error-message">{errors.common}</div>
        <Button loading={loading} className="">
          Login
        </Button>

        <div className="text-center text-sm mt-6">You don't have any account ? <a href="/register">Register here</a></div>
      </form>
    </div>
  );
}