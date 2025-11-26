import React from "react";
import {SignedIn, SignedOut, SignInButton, UserButton} from "@clerk/clerk-react";
import { Outlet, Link } from "react-router-dom";
import "../App.css";

export function Layout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <img
              src="https://img.icons8.com/3d-fluency/94/greentech.png"
              alt="EcoPulse logo"
              width="50"
              height="50"
            />
            <h1 className="logo-text">EcoPulse</h1>
          </div>

          <nav className="navbar">
            <Link to="/">Accueil</Link>
            <Link to="/audit">Faire un audit</Link>
            <Link to="/about">Qui sommes-nous ?</Link>
            <Link to="/contact">Contacts</Link>
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

        {/* FOOTER */}
      <footer className="footer">
        © 2025 EcoPulse – Développé par l’équipe 6ix-Resolve 🌱
      </footer>
    </div>
  );
}
