import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import TextInput from "../components/TextInput.jsx";
import { useAuthContext } from "../context/AuthContext.jsx";
import { authService } from "../services/authService.js";
import { getErrorMessage } from "../utils/formatters.js";

export default function LoginPage() {
  const { login, token } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/dashboard" replace />;

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Completează emailul și parola.");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(form);
      const jwt = response.token || response.jwt || response.accessToken;

      if (!jwt) {
        setError("Backendul nu a returnat token. Verifică formatul răspunsului la login.");
        return;
      }

      login(jwt);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">TransportApp Admin</h1>
        <p className="mb-6 mt-2 text-sm text-slate-500">Autentificare Admin / SuperAdmin</p>

        <ErrorBox message={error} />

        <div className="space-y-4">
          <TextInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@test.ro"
          />
          <TextInput
            label="Parolă"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Se conectează..." : "Login"}
          </Button>
        </div>
      </form>
    </div>
  );
}
