// CurrentUserContext.js
import React, { createContext } from "react";

const AppLevelContext = createContext();

export const AppContextProvider = ({ children, value }) => {
  return (
    <AppLevelContext.Provider value={value}>
      {children}
    </AppLevelContext.Provider>
  );
};

export default AppLevelContext;
