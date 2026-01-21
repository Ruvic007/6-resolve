import React from "react";
import ReactDOM from "react-dom/client";
import ClerkProviderWithRoutes from "./auth/ClerkProviderWithRoutes.jsx";
import App from "./App";
import "./index.css";
import { ToastContainer } from "react-toastify";
import { AppProvider } from "./components/AppContext.jsx";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProviderWithRoutes>
      <AppProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </AppProvider>
    </ClerkProviderWithRoutes>
  </React.StrictMode>
);
