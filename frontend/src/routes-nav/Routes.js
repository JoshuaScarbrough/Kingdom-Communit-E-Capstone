import React from "react";
import { Router, Routes, Route } from "react-router-dom";
import Homepage from "../homepage/Homepage";
import RegisterForm from "../auth/RegisterForm"
import LoginForm from "../auth/LoginForm";


/**
 * This is going to be for routes that are site-wide. 
 * Some of these routes should only be visible when logged in.
 * 
 * They will be wrapped insdie of a <PrivateRoute>, which is authorization for the componet.
 * 
 * Visiting a non-existant route delivers you to the homepage.
 */

function AllRoutes({login, signup}){

    return (
            <Routes>

                <Route path="/" element={<Homepage />} />
                <Route path="/auth/register" element={<RegisterForm />} />
                <Route path="/auth/login" element={<LoginForm login={login} />} />



            </Routes>
    );
}

export default AllRoutes