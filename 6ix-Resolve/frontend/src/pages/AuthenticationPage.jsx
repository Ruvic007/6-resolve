import React from "react";
import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";
import {useLocation, Link, Navigate} from "react-router-dom";
import "../App.css";

export function AuthenticationPage() {
  const location = useLocation();
  const isSignUp = location.pathname.includes("sign-up");

  return (
    <div className="auth-container">
      <SignedOut>
        <div className="auth-box">
          {isSignUp ? (
            <>
              <SignUp routing="path" path="/sign-up" />
              <p className="auth-toggle">
                Déjà un compte ? <Link to="/sign-in">Se connecter</Link>
              </p>
            </>
          ) : (
            <>
              <SignIn oauthFlow= "popup" appearance="modal" routing="path" path="/sign-in" />
            </>
          )}
        </div>
      </SignedOut>

      <SignedIn>
        <div className="redirect-message">
          <Navigate to="/" replace />
        </div>
      </SignedIn>
    </div>
  );
}
