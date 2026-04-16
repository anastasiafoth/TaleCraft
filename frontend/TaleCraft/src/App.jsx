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
import AuthorLayout from "../components/AuthorLayout.jsx";
import AuthorDashboard from "../pages/Author/AuthorDashboard.jsx";

import BookEdit from "../pages/Author/BookEdit.jsx";
import BookEditLayout from "../components/BookEditLayout";
import ChapterCards from "../components/ChapterCards.jsx";
import ChapterEdit from "../pages/Author/ChapterEdit.jsx";
import PageCards from "../components/PageCards.jsx";
import PageEdit from "../components/PageEdit";
import CharacterTemplateEdit from "../components/CharacterTemplateEdit";

import ParentLayout from "../components/ParentLayout.jsx";
import ParentDashboard from "../pages/Parent/ParentDashboard.jsx";
import NewChild from "../pages/Parent/Children/NewChild.jsx";
import Personalizations from "../pages/Parent/Personalizations/Personalizations.jsx";
import Personalization from "../pages/Parent/Personalizations/Personalization.jsx";
import NewPersonalization from "../pages/Parent/Personalizations/NewPersonalization.jsx";

import ChildrenDashboard from "../pages/Parent/Children/ChildrenDashboard.jsx";
import Reading from "../pages/Parent/Children/Reading.jsx";

import AuthRequired from "../components/AuthRequired.jsx";
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
              </Route>
              <Route path="pages">
                <Route index element={<PageCards />} />
                <Route path="new" element={<PageEdit />} />
                <Route path=":pageId/edit" element={<PageEdit />} />
              </Route>

              <Route
                path="character_templates/new"
                element={<CharacterTemplateEdit />}
              />
              <Route
                path="character_templates/:templateId"
                element={<CharacterTemplateEdit />}
              />
            </Route>
          </Route>
        </Route>

        <Route element={<AuthRequired allowedRoles={["Parent"]} />}>
          <Route path="parent" element={<ParentLayout />}>
            <Route index element={<ParentDashboard />} />
            <Route path="children/new" element={<NewChild />} />

            {/* children with personalizations */}
            <Route path="children/:childId">
              <Route index element={<ChildrenDashboard />} />
              <Route path="personalizations">
                <Route index element={<Personalizations />} />
                <Route
                  path=":personalizationId/reading"
                  element={<Reading />}
                />
              </Route>
            </Route>

            {/* personalizations for parents */}
            <Route path="personalizations">
              <Route index element={<Personalizations />} />
              <Route path="new" element={<NewPersonalization />} />
              <Route path=":id" element={<Personalization />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
