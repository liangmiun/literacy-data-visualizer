import React from "react";
import { Navigate } from "react-router-dom";
//import { useAuth } from "./AuthContext";

const ProtectedWrapper = ({ element }) => {
  //const { currentUser } = useAuth(); // Uncomment this line if using the AuthContext.js file
  const currentUser = true;

  return currentUser ? element : <Navigate to="/login" replace />;
};

export default ProtectedWrapper;
