import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../src/AuthContext";
import { addNewChild } from "../../../src/api";

export default function NewChild() {
  const { token } = useAuth();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    birthdate: "",
    profile_img: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setStatus("submitting");
    try {
      const childData = await addNewChild(token, form);
      if (childData) {
        setSuccess(true);
      }
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
      <>
        <h1 className="text-xl font-bold">Add new child</h1>
        {error && <h3 className="error">{error}</h3>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <input
            name="first_name"
            onChange={handleChange}
            type="text"
            placeholder="first name"
            className="input"
          />
          <input
            name="birthdate"
            onChange={handleChange}
            type="date"
            placeholder="last name"
            className="input"
          />

          <button
            disabled={status === "submitting"}
            className="btn btn-primary"
          >
            {status === "submitting" ? "Registering..." : "Register"}
          </button>
        </form>
      </>
      {success && (
        <div className="flex flex-col items-center gap-4 text-center pt-10">
          <div className="text-success">Added new child!</div>
          {navigate("/parent")}
        </div>
      )}
    </div>
  );
}
