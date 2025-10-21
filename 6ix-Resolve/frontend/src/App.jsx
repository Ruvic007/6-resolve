import { useState } from 'react'
import './App.css'
import ClerkProviderWithRoutes from "./auth/ClerkProviderWithRoutes.jsx";
import {Routes, Route} from "react-router-dom";
import {Layout} from "./layout/Layout.jsx"
import {AuthenticationPage} from "./auth/AuthenticationPage.jsx";
import './App.css'
import {HomePage} from "./pages/HomePage.jsx";

function App() {
  return <ClerkProviderWithRoutes>
      <Routes>
          <Route path="/sign-in/*" element={<AuthenticationPage/>}/>
          <Route path="/sign-up" element={<AuthenticationPage/>}/>
          <Route element={<Layout/>}>
              <Route path = "/" element={<HomePage/>}/>
          </Route>
      </Routes>
  </ClerkProviderWithRoutes>
}



export default App
