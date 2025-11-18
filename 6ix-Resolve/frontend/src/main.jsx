import React from "react";
import ReactDOM from "react-dom/client";
import ClerkProviderWithRoutes from "./auth/ClerkProviderWithRoutes.jsx";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProviderWithRoutes>
      <App />
    </ClerkProviderWithRoutes>
  </React.StrictMode>
);
