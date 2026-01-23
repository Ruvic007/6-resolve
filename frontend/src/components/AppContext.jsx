import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [hasCompletedForm, setHasCompletedForm] = useState(false);
  const [lastCompanyId, setLastCompanyId] = useState(null);

  // Fonction pour marquer le formulaire comme complété et stocker l'ID
  const completeForm = (companyId) => {
    setHasCompletedForm(true);
    setLastCompanyId(companyId);
  };

  return (
    <AppContext.Provider value={{
      hasCompletedForm,
      setHasCompletedForm,
      lastCompanyId,
      setLastCompanyId,
      completeForm
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
