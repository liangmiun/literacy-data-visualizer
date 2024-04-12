// This is a context to keep track of whether the school/tenure/class and grade/schoolyear/stanine options have empty impact or not.
// It is currently not in use because MUI treeview makes collapsed nodes unrendered and their state are not updated with the context.
// The gray-out-empty-impact functionality is now implemented in each hiearchical components.

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
