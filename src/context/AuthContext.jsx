import { createContext, useEffect, useState } from "react";
import { getStoredUser, persistUser } from "../utils/session";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const updateUser = (data) => {
    setCurrentUser(data);
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking session or just ensure initial load is done
    setLoading(false);
  }, []);

  useEffect(() => {
    persistUser(currentUser);
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{ currentUser, updateUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
