import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, ClipboardList, ScrollText, Plus, LogOut } from "lucide-react";
import Dock from "../components/Dock";
import "../App.css";

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const dockItems = [
    {
      icon: <LayoutDashboard size={22} />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
      isActive: location.pathname.startsWith("/dashboard")
    },
    {
      icon: <Plus size={22} />,
      label: "Nouvel Audit",
      onClick: () => navigate("/audit"),
      isActive: location.pathname === "/audit"
    },
    {
      icon: <ScrollText size={22} />,
      label: "Historique",
      onClick: () => navigate("/historique"),
      isActive: location.pathname === "/historique"
    },
  ];

  return (
    <div className="app-layout app-mode">
      {/* Header minimaliste pour l'app */}
      <header className="app-header-minimal">
        <div className="header-minimal-content">
          <div className="logo-minimal" onClick={() => navigate("/dashboard")}>
            <img
              src="https://img.icons8.com/3d-fluency/94/greentech.png"
              alt="EcoPulse logo"
              width="36"
              height="36"
            />
            <span className="logo-text-minimal">EcoPulse</span>
          </div>
          <div className="header-minimal-actions">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9"
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* Contenu principal avec padding pour le dock */}
      <main className="app-main-dock">
        <Outlet />
      </main>

      {/* Dock de navigation */}
      <Dock
        items={dockItems}
        panelHeight={64}
        baseItemSize={48}
        magnification={65}
        distance={150}
      />
    </div>
  );
}
