import { Routes, Route } from "react-router-dom";
import { Layout } from "./layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import Audit from "./pages/Audit";
import { AuthenticationPage } from "./pages/AuthenticationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Contacts } from "./pages/Contacts";
import { About } from "./pages/About";
import { Dashboard } from "./pages/Dashboard";
import { Historique } from "./pages/Historique";

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
        {/* Routes publiques */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contacts />} />
        
        {/* ROUTES DASHBOARD AJOUTÉES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:companyId"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ROUTE HISTORIQUE */}
        <Route
          path="/historique"
          element={
            <ProtectedRoute>
              <Historique />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}