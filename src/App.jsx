import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { listen as TauriEventListen } from "@tauri-apps/api/event"

import Home from "./pages/Home";
import Login from "./pages/Login";
import BackgroundLogin from "./pages/BackgroundLogin";

function App() {

    useEffect(() => {
        TauriEventListen("client://background-loggin-error", () => {
            location.href = "/auth/login";
        });
    }, []);

    return (<>
        <Router>
          <Routes>
                <Route path="/" element={<Home />}/>          
                <Route path="/auth/login" element={<Login />}/>
                <Route path="/auth/background/login" element={<BackgroundLogin />}/>
            </Routes>
        </Router>
    </>);
}

export default App;