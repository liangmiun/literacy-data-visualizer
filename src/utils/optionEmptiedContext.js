import React, { createContext, useContext, useState } from "react";

const OptionEmptiedContext = createContext();

export const OptionEmptiedProvider = ({ children }) => {
  const [emptiedStates, setEmptiedStates] = useState({});

  // Function to update the state
  const updateEmptiedState = (componentId, isEmptied) => {
    setEmptiedStates((current) => ({ ...current, [componentId]: isEmptied }));
  };

  return (
    <OptionEmptiedContext.Provider
      value={{ emptiedStates, updateEmptiedState }}
    >
      {children}
    </OptionEmptiedContext.Provider>
  );
};

export const useOptionEmptied = () => useContext(OptionEmptiedContext);
