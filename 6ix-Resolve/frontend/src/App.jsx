import { Routes, Route } from "react-router-dom";
import { Layout } from "./layout/Layout.jsx";
import HomePage from "./pages/HomePage";
import Audit from "./pages/Audit";
import {AuthenticationPage} from "./pages/AuthenticationPage";
import ProtectedRoute from "./components/ProtectedRoute";

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
      </Route>
    </Routes>
  );
}
