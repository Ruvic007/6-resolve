import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [hasCompletedForm, setHasCompletedForm] = useState(false);
  return (
    <AppContext.Provider value={{ hasCompletedForm, setHasCompletedForm }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
