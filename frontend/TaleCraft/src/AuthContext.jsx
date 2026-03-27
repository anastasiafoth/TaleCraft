import { createContext, useContext, useState } from "react";
import { loginUser, getUserData } from "./api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (creds) => {
    try {
      // Login -> gets Token
      const loginData = await loginUser(creds);
      const token = loginData.access_token;

      // Get user data
      const userData = await getUserData(token);
      console.log(userData);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
