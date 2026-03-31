import { useState } from "react";
import { useAuth } from "../src/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    password: "",
  });

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setStatus("submitting");
    try {
      const userData = await register(form);
    } catch (err) {
      if (err.status === 403) {
        navigate("/register", {
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
          name="first_name"
          onChange={handleChange}
          type="text"
          placeholder="first name"
        />
        <input
          name="last_name"
          onChange={handleChange}
          type="text"
          placeholder="last name"
        />
        <input
          name="email"
          onChange={handleChange}
          type="email"
          placeholder="Email address"
        />
        <select name="role" onChange={handleChange} defaultValue="">
          <option value="" disabled>
            Select role
          </option>
          <option value="Author">Author</option>
          <option value="Parent">Parent</option>
        </select>
        <input
          name="password"
          onChange={handleChange}
          type="password"
          placeholder="Password"
        />
        <button
          disabled={status === "submitting"}
          className="btn btn-wide mt-4"
        >
          {status === "submitting" ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
