import { Routes, Route } from "react-router-dom";
import { Layout } from "./layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import Audit from "./pages/Audit";
import { AuthenticationPage } from "./pages/AuthenticationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Contacts } from "./pages/Contacts"; 
import { About } from "./pages/About"; 

export default function App() {
  return (
    <Routes>
      {/* Routes d'authentification séparées */}
      <Route path="/sign-in/*" element={<AuthenticationPage />} />
      <Route path="/sign-up/*" element={<AuthenticationPage />} />

      {/* Routes principales */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/audit"
          element={
            <ProtectedRoute>
              <Audit />
            </ProtectedRoute>
          }
        />
        {/* AJOUTEZ CES DEUX ROUTES */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contacts />} />
      </Route>
    </Routes>
  );
}
