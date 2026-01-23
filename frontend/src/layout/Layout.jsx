import React, { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import "../App.css";
import { useApp } from "../components/AppContext.jsx";

export function Layout() {
  const { hasCompletedForm, lastCompanyId } = useApp();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-content">
          <div
            className="logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <img
              src="https://img.icons8.com/3d-fluency/94/greentech.png"
              alt="EcoPulse logo"
              width="50"
              height="50"
            />
            <h1 className="logo-text">EcoPulse</h1>
          </div>

          <nav className="navbar">
            {/* Accueil - toujours vers la page d'accueil */}
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? "active-link" : ""}
            >
              Accueil
            </NavLink>

            {/* Dropdown pour les audits - toujours visible avec toutes les options */}
            <div
              className="nav-dropdown"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="nav-dropdown-trigger">
                Audit <span className="dropdown-arrow">▼</span>
              </button>

              {isDropdownOpen && (
                <div className="nav-dropdown-menu">
                  <NavLink
                    to="/audit"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    📝 Faire un audit
                  </NavLink>
                  <NavLink
                    to="/historique"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    📜 Historique des audits
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to="/about" className={({ isActive }) => isActive ? "active-link" : ""}>Qui sommes-nous ?</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "active-link" : ""}>Contacts</NavLink>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-login">Se connecter</button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="footer">
        © 2025 EcoPulse – Développé par l’équipe 6ix-Resolve 🌱
      </footer>
    </div>
  );
}
