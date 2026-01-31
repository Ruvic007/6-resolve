import { Routes, Route } from "react-router-dom";
import { Layout } from "./layout/Layout.jsx";
import { AppLayout } from "./layout/AppLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import Audit from "./pages/Audit";
import { AuthenticationPage } from "./pages/AuthenticationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Contacts } from "./pages/Contacts";
import { About } from "./pages/About";
import { Dashboard } from "./pages/Dashboard";
import { Historique } from "./pages/Historique";
import Recommendations from "./pages/Recommendations";

export default function App() {
  return (
    <Routes>
      {/* Routes d'authentification */}
      <Route path="/sign-in/*" element={<AuthenticationPage />} />
      <Route path="/sign-up/*" element={<AuthenticationPage />} />

      {/* Routes publiques avec Layout classique */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contacts />} />
      </Route>

      {/* Routes applicatives avec AppLayout (dock) */}
      <Route element={<AppLayout />}>
        <Route
          path="/audit"
          element={
            <ProtectedRoute>
              <Audit />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/historique"
          element={
            <ProtectedRoute>
              <Historique />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* Route 404 - Optionnel mais recommandé */}
      <Route path="*" element={<div>404 - Page non trouvée</div>} />
    </Routes>
  );
}