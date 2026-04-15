import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/AuthContext";
import {
  getChaptersByBook,
  getChapterById,
  addChapter,
  updateChapter,
  deleteChapter,
} from "../../src/api";

export default function ChapterEdit() {
  return <h1>Edit/Create Chapter form</h1>;
}
