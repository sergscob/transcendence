import { useState } from "react";
import { useNavigate } from "react-router";
import API from "../api/api";
import { getErrorMessage } from "../utils/errors";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";


function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate()

  async function changeForm(field) {
    setErrors({})
    setForm({...form, ...field})
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
    <div className="flex h-screen items-center justify-center bg-gray-100">
      { registered ? 
      <div>
      <h3 className="text-l mb-4 text-center">Registration succeeded !</h3>
      <Button className="" onClick={toLogin}>Go to login</Button>
      </div>
      :
      <form 
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-100"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>
        <Input
          value={form.username}
          onChange={e => changeForm({ username: e.target.value })}
          placeholder="Username"
        />
        <div className="error-message">{errors.username}</div>
        
        <Input
          value={form.email}
          onChange={e => changeForm({ email: e.target.value })}
          placeholder="Email"
        />
        <div className="error-message">{errors.email}</div>

        <Input
          type="password"
          value={form.password}
          onChange={e => changeForm({ password: e.target.value })}
          placeholder="Password"
        />
        <div className="error-message">{errors.password}</div>
        <div className="error-message">{errors.common}</div>
        <Button className="" loading={loading}>Register</Button>
        <div className="text-sm mt-6 text-center">You have an account ? <a className="simple-link" href="/login">Login here</a></div>

      </form>
      }
    </div>
  );
}

export default Register;