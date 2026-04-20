import { useParams } from "react-router-dom";

export default function PersonalizationEdit() {
  const { personalizationId } = useParams();
  return <h1>View Personalization no:{personalizationId} and edit / delete</h1>;
}
