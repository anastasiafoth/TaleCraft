import { useState } from "react";
import { useAuth } from "../src/AuthContext";
import { useNavigate } from "react-router-dom";
import EmailInput from "../components/EmailInput";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setStatus("submitting");
    try {
      const userData = await login(form);
      if (userData != null) {
        // Checks for role and navigates to dashboard
        if (userData.role === "Author") {
          navigate("/author");
        } else if (userData.role === "Parent") {
          navigate("/parent");
        }
      }
    } catch (err) {
      if (err.status === 403) {
        navigate("/login", {
          state: { message: err.message },
          replace: true,
        });
      } else {
        setError(err.message);
      }
    } finally {
      setStatus("idle");
    }
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <div className="flex flex-col items-center min-h-screen m-20">
      <h1>Sign in to your account</h1>
      {error && <h3 className="login-error">{error}</h3>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        <EmailInput
          input={
            <input
              name="email"
              onChange={handleChange}
              type="email"
              placeholder="Email address"
            />
          }
        />

        <PasswordInput
          input={
            <input
              name="password"
              onChange={handleChange}
              type="password"
              placeholder="Password"
            />
          }
        />

        <button disabled={status === "submitting"} className="btn btn-primary">
          {status === "submitting" ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
