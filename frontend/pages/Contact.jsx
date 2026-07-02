import { useState, useEffect } from "react";
import { contact } from "../src/api.jsx";

export default function Contact() {
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    message: "",
    privacy_policy: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setStatus("submitting");
    try {
      console.log(form);
      const contactData = await contact(form);
      if(contactData){
        setSuccess(true)
      }
    } catch (err) {
      setError(err.error);
    } finally {
      setStatus("idle");
    }
  };

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  return (
    <section className="grid min-h-screen w-full grid-cols-1 items-center md:grid-cols-2">
      <div className="p-6 sm:p-12 lg:p-16">
        <div className="mb-10">
          <h2 className="my-4 text-3xl font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-message-square-icon lucide-message-square mb-4"
            >
              <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
            </svg>
            Contact us
          </h2>
          <p className="text-muted-foreground max-w-lg text-lg">
            Whether you have questions or you would just like to say hello,
            contact us.
          </p>
        </div>
        <p className="text-s text-red-500">{error}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 lg:grid-cols-2">
            <div className="space-y-2">
              <h1>First Name *</h1>
              <input
                type="text"
                name="first_name"
                onChange={handleChange}
                placeholder="John"
                className="input input-bordered input-sm w-full"
              />
            </div>
            <div className="space-y-2">
              <h1>Last Name</h1>
              <input
                type="text"
                name="last_name"
                onChange={handleChange}
                placeholder="Doe"
                className="input input-bordered input-sm w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <h1>Email Address *</h1>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              placeholder="someone@example.com"
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div className="space-y-2">
            <h1>Phone Number</h1>
            <input
              name="phone"
              type="tel"
              maxLength={16}
              onChange={handleChange}
              placeholder="e.g., +1 123-456-7890"
              pattern="^\+\d{1,3}\s\d{1,4}\d{1,4}\d{4}$"
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div className="space-y-2">
            <h1>Message *</h1>
            <textarea
              name="message"
              className="w-full h-20 input input-bordered input-sm "
              type="text"
              id="message"
              onChange={handleChange}
              placeholder="Something about your request."
              maxLength={5000}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              name="privacy_policy"
              type="checkbox"
              onChange={handleChange}
              id="privacy-policy"
            />
            <h1 className="cursor-pointer text-sm font-normal">
              You agree to your friendly{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy *
              </a>
            </h1>
          </div>
          <p className="text-xs">All fileds marked with * are required.</p>
          <button
            disabled={status !== "idle"}
            className="btn btn-primary flex-1 w-full"
          >
            {status == "submitting" ? "Sending..." : "Send Message"}
          </button>
        </form>
        {success && <p>{}</p>}
      </div>
      <img
        src="https://pub-5c6211fe5e5e407fa14819f4ac3be544.r2.dev/main%20page/bg-contact-2.png"
        alt="contact"
        className="hidden h-full w-full object-cover object-center md:block"
      />
    </section>
  );
}
