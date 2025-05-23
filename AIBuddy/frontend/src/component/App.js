import React from "react";
import ReactDOM from "react-dom/client";
import { useState, useEffect} from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import MainApp from "./MainApp";

function App() {
    // useEffect(() => {
    //     axios.post("http://localhost:8000/api/", {"rat": "test"}).then((response) => {
    //         console.log(response.data);
    //     });
    // }, []);
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainApp />} />
                {/* <Route path="/dashboard" element={<MainPage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgotPassword" element={<ForgotPasswordEmail />} />
                <Route path="/changePassword/" element={<ChangePassword/>}/> */}
            </Routes>
        </Router>
        // <div>Hello World</div>
    )
}

const appDiv = document.getElementById("app");
const root = ReactDOM.createRoot(appDiv);
root.render(<App />);