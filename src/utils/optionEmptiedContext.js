import React, { createContext, useContext, useState, useCallback } from "react";

const OptionEmptiedContext = createContext();

export const OptionEmptiedProvider = ({ children }) => {
  const [emptiedStates, setEmptiedStates] = useState({});

  // Function to update the state
  // const updateEmptiedState = (componentId, isEmptied) => {
  //   setEmptiedStates((current) => ({ ...current, [componentId]: isEmptied }));
  // };

  const updateEmptiedState = useCallback(
    (componentId, isEmptied) => {
      setEmptiedStates((current) => ({ ...current, [componentId]: isEmptied }));
    },
    [setEmptiedStates]
  );

  return (
    <OptionEmptiedContext.Provider
      value={{ emptiedStates, updateEmptiedState }}
    >
      {children}
    </OptionEmptiedContext.Provider>
  );
};

export const useOptionEmptied = () => useContext(OptionEmptiedContext);
