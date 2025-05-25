import React, {useContext} from "react";
import {Link} from "react-router-dom";
import "./Homepage.css";

/**
 * Homepage of the site.
 * 
 * Should see the welcome message and the login/register buttons.
 * 
 * Routed at /
 * 
 * Routes -> Homepage
 */

function Homepage() {

    // Clears all the data from the session so that a user must re-enter their username and password
    sessionStorage.clear()


    return(
        <div>

            <nav>
                <Link to="/auth/login"> Login </Link>
                <Link to="/auth/register"> Register </Link>
            </nav>

            <h1> Kingdom Communit-E </h1>


        </div>
    )
}

export default Homepage;
