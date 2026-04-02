import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import NewBook from "../pages/Author/NewBook.jsx";

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
    <BrowserRouter>
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
              <Route path="books/new" element={<NewBook />} />
              <Route path="books/:id" element={<BookDetail />} />
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
    </BrowserRouter>
  );
}

export default App;
