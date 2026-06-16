import { useState } from "react";
import { forgotPassword } from "../src/api.jsx"
import { useNavigate, useLocation } from "react-router-dom";
import EmailInput from "../components/User/EmailInput";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: ""});
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setStatus("submitting");
    try {
      const message = await forgotPassword(form);
      console.log(message);  
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
      <h1>Enter your Email: </h1>
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

        <button disabled={status === "submitting"} className="btn btn-primary">
          {status === "submitting" ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
