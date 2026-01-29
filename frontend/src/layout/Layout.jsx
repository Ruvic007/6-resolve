import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { Leaf } from "lucide-react";
import "../App.css";

export function Layout() {
  const navigate = useNavigate();

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
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? "active-link" : ""}
            >
              Accueil
            </NavLink>

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
        © 2025 EcoPulse – Développé par l'équipe 6ix-Resolve <Leaf size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
      </footer>
    </div>
  );
}
