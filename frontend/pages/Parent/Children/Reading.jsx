import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  createReadingProgress,
  updateReadingProgress,
  getReadingProgressById,
} from "../../../src/api";
import { useAuth } from "../../../src/AuthContext";

export default function Reading() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  const { token } = useAuth();
  const { childId, personalizationId } = useParams();

  useEffect(() => {
    async function load() {
      try {
        const progress = await createReadingProgress(
          { child_id: childId, personalization_id: personalizationId },
          token,
        );
        setProgress(progress);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, childId, personalizationId]);

  // UI Handling
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;



  return (
    <h1>
      Child no:{childId} is reading personalization no:{personalizationId}
      <br />
      Current page id: {progress?.current_page_id}
    </h1>
  );
}
