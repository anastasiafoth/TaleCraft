import { useState } from "react";
import { useAuth } from "../src/AuthContext";
import { useNavigate } from "react-router-dom";
import EmailInput from "../components/User/EmailInput";
import PasswordInput from "../components/User/PasswordInput";
import Redirection from "../components/User/Redirection";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

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
      if (userData) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (err) {
      if (err.status === 403) {
        navigate("/register", {
          state: { message: err.message },
          replace: true,
        });
      } else {
        setError(err.error);
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
      {success ? (
        <Redirection message="Registration was successfull!" />
      ) : (
        <>
          <h1>Create an account</h1>
          {error && <h3 className="login-error">{error}</h3>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <input
              name="first_name"
              onChange={handleChange}
              type="text"
              placeholder="first name"
              className="input"
            />
            <input
              name="last_name"
              onChange={handleChange}
              type="text"
              placeholder="last name"
              className="input"
            />

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

            <select
              name="role"
              onChange={handleChange}
              defaultValue=""
              className="select"
            >
              <option value="" disabled>
                Select role
              </option>
              <option value="Author">Author</option>
              <option value="Parent">Parent</option>
            </select>

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
            <button
              disabled={status === "submitting"}
              className="btn btn-primary"
            >
              {status === "submitting" ? "Registering..." : "Register"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
