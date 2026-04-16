import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import CharacterCard from "../../components/CharacterCard"

export default function CharacterTemplateEdit() {

  const {id} = useParams()
  return (
    <>
      <Link
        to={`/author/books/${id}/character_templates`}
        className="text-sm mt-2 underline cursor-pointer"
      >
        {" "}
        Go back to all Templates
      </Link>
      

    </>
  );
}
