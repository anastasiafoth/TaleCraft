import PersonalizationsCards from "../../../components/PersonalizationsCards";
import { useState, useEffect } from "react";
import { useAuth } from "../../../src/AuthContext";
import { getAllPersonalizations } from "../../../src/api";

export default function Personalizations({ role = "parent" }) {
  const { token } = useAuth();
  const [personalizations, setPersonalizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllPersonalizations(token)
      .then(setPersonalizations)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <span className="loading loading-dots loading-md" />;
  if (error) return <p className="text-error">{error.message}</p>;

  return (
    <section>
      <h1>All personalization from this parent here</h1>
      <section>
        <PersonalizationsCards
          personalizations={personalizations}
          role={role}
        />
      </section>
    </section>
  );
}
