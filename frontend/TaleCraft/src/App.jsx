import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home.jsx";
import Books from "../pages/Books.jsx";
import About from "../pages/About.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Contact from "../pages/Contact.jsx";
import AuthorDashboard from "../pages/Author/AuthorDashboard.jsx";
import NewBook from "../pages/Author/NewBook.jsx";

import Layout from "../components/Layout.jsx";
import AuthorLayout from "../components/AuthorLayout.jsx";

import AuthRequired from "../components/AuthRequired.jsx";
import NotFound from "../pages/Error/NotFound.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="books" element={<Books />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          <Route element={<AuthRequired />}>
            <Route path="/author" element={<AuthorLayout />}>
              <Route index element={<AuthorDashboard />} />
              <Route path="books" element={<Books />} />
              <Route path="new" element={<NewBook />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
