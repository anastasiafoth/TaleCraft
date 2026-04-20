import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home.jsx";
import Books from "../pages/Books.jsx";
import About from "../pages/About.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Logout from "../pages/Logout.jsx";
import Contact from "../pages/Contact.jsx";
import BookDetail from "../pages/BookDetail.jsx";

import Layout from "../components/Layout.jsx";
import AuthorLayout from "../components/Author/AuthorLayout.jsx";
import AuthorDashboard from "../pages/Author/AuthorDashboard.jsx";

import BookEdit from "../pages/Author/BookEdit.jsx";
import BookEditLayout from "../components/Books/BookEditLayout";
import ChapterCards from "../components/Books/ChapterCards.jsx";
import ChapterEdit from "../pages/Author/ChapterEdit.jsx";
import PageCards from "../components/Books/PageCards.jsx";
import PageEdit from "../pages/Author/PageEdit";
import CharacterTemplateEdit from "../pages/Author/CharacterTemplateEdit";
import CharactersCards from "../components/CharactersCards.jsx";

import ParentLayout from "../components/Parents/ParentLayout.jsx";
import ParentDashboard from "../pages/Parent/ParentDashboard.jsx";
import NewChild from "../pages/Parent/Children/NewChild.jsx";
import PersonalizationsCards from "../components/Parents/PersonalizationsCards.jsx";
import PersonalizationEdit from "../pages/Parent/PersonalizationEdit.jsx";

import ChildrenDashboard from "../pages/Parent/Children/ChildrenDashboard.jsx";
import Reading from "../pages/Parent/Children/Reading.jsx";

import AuthRequired from "../components/User/AuthRequired.jsx";
import NotFound from "../pages/Error/NotFound.jsx";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="books" element={<Books />} />
        <Route path="books/:id" element={<BookDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="logout" element={<Logout />} />

        <Route element={<AuthRequired allowedRoles={["Author"]} />}>
          <Route path="author" element={<AuthorLayout />}>
            <Route index element={<AuthorDashboard />} />

            <Route element={<BookEditLayout />}>
              <Route path="books/new" element={<BookEdit />} />
            </Route>

            <Route path="books/:id" element={<BookEditLayout />}>
              <Route path="edit" element={<BookEdit />} />
              <Route path="chapters">
                <Route index element={<ChapterCards />} />
                <Route path="new" element={<ChapterEdit />} />
                <Route path=":chapterId/edit" element={<ChapterEdit />} />
                <Route path=":chapterId/pages">
                  <Route index element={<PageCards />} />
                  <Route path="new" element={<PageEdit />} />
                  <Route path=":pageId/edit" element={<PageEdit />} />
                </Route>
              </Route>

              <Route path="character_templates">
                <Route index element={<CharactersCards />} />
                <Route path="new" element={<CharacterTemplateEdit />} />
                <Route path=":templateId" element={<CharacterTemplateEdit />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route element={<AuthRequired allowedRoles={["Parent"]} />}>
          <Route path="parent" element={<ParentLayout />}>
            <Route index element={<ParentDashboard />} />
            <Route path="children/new" element={<NewChild />} />

            <Route path="children/:childId">
              <Route index element={<ChildrenDashboard />} />
            </Route>

            {/* personalizations for parents */}
            <Route path="personalizations">
              <Route index element={<PersonalizationsCards />} />
              <Route path="new" element={<PersonalizationEdit />} />
              <Route
                path=":personalizationId"
                element={<PersonalizationEdit />}
              />
              {/* children with personalizations */}
              <Route path=":personalizationId/reading" element={<Reading />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
