import { useState } from "react";
import { useAuth } from "../src/AuthContext";
import { useNavigate } from "react-router-dom";

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
    <div className="login-container">
      <h1>Sign in to your account</h1>
      {error && <h3 className="login-error">{error}</h3>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          name="email"
          onChange={handleChange}
          type="email"
          placeholder="Email address"
        />
        <input
          name="password"
          onChange={handleChange}
          type="password"
          placeholder="Password"
        />
        <button disabled={status === "submitting"}>
          {status === "submitting" ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
