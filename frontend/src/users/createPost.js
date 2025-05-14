import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

/** 
 * Route for a User to be able to edit their profile.
 * Form style similar to the login and register routes.
 */

function CreatePost(){
    const navigate = useNavigate();



return(
    <h1> We will be creating a post here </h1>
)
}

export default CreatePost;