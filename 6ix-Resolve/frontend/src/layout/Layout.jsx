import "react"
import {SignedIn,SignedOut,UserButton} from "@clerk/clerk-react";
import {Outlet,Link,Navigate} from "react-router-dom";

export function Layout(){
    return <div className="app-layout">
        <header className="app-header">
            <div className="header-content">
                <div className="logo" style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <img width="50" height="50" src="https://img.icons8.com/3d-fluency/94/greentech.png" alt="greentech"/>
                    <h1> EcoPulse</h1>
                </div>
                <nav>
                    <SignedIn>
                        <Link to="/">Page D'accueil</Link>
                        <UserButton/>
                    </SignedIn>

                </nav>
            </div>
        </header>
        <main className="app-main">
            <SignedOut>
                <Navigate to="/sign-in" replace/>
            </SignedOut>
            <SignedIn>
                <Outlet/>
            </SignedIn>
        </main>

    </div>
}