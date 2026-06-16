import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PasswordInput from "../components/User/PasswordInput.jsx";
import { resetPassword } from "../src/api.jsx";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ password: "" });

  const resetToken = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus("submitting");
    try {
      const message = await resetPassword(form, resetToken);
      console.log(message);
    } catch (err) {
      setError(err.message);
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
      <h1>Reset your Password:</h1>
      {error && <h3 className="login-error">{error}</h3>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
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
          {status === "submitting" ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
