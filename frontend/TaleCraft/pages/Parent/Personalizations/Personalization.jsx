import { useParams } from "react-router-dom";

export default function Personalization() {
  const { id } = useParams();
  return <h1>View Personalization no:{id} and edit / delete</h1>;
}
