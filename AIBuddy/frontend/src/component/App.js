import React from "react";
import ReactDOM from "react-dom/client";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
    return (
        // <Router>
        //     <Routes>
        //         <Route path="/" element={<Login />} />
        //         <Route path="/dashboard" element={<MainPage />} />
        //         <Route path="/signup" element={<Signup />} />
        //         <Route path="/forgotPassword" element={<ForgotPasswordEmail />} />
        //         <Route path="/changePassword/" element={<ChangePassword/>}/>
        //     </Routes>
        // </Router>
        <div>Hello World</div>
    )
}

const appDiv = document.getElementById("app");
const root = ReactDOM.createRoot(appDiv);
root.render(<App />);