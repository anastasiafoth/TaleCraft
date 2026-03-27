import { createContext, useContext, useState } from "react";
import { loginUser, getUserData } from "./api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );

  const login = async (creds) => {
    try {
      // Login -> gets Token
      const loginData = await loginUser(creds);
      const token = loginData.access_token;
      localStorage.setItem("token", token);
      setToken(token);

      // Get user data
      const userData = await getUserData(token);
      console.log(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return userData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = () => {
    const navigate = useNavigate();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
