import React from "react";
import { Router, Routes, Route } from "react-router-dom";
import Homepage from "../homepage/Homepage";
import RegisterForm from "../auth/RegisterForm"
import LoginForm from "../auth/LoginForm";
import UserHomepage from "../users/UserHomepage";
import EditUser from "../users/EditUser";
import UsersFollowing from "../following-followers/Following";
import UsersFollowers from "../following-followers/Followers";
import CreatePost from "../users/createPost";
import EditUserPics from "../users/EditUserPics";
import UserFeed from "../feed/UsersFeed";
import CommentPost from "../feed/CommentPost";
import CommentEvent from "../feed/commentEvent";
import CommentUrgentPost from "../feed/commentUrgentPost";



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
                <Route path="/users" element={<UserHomepage />} />
                <Route path="/users/edit" element={<EditUser />} />
                <Route path="/users/editPics" element={<EditUserPics />} />
                <Route path="/users/following" element={<UsersFollowing />} />
                <Route path="/users/followers" element={<UsersFollowers />} />
                <Route path="/users/CreatePost" element={<CreatePost />} />
                <Route path="/users/feed" element={<UserFeed />} />
                <Route path="/users/feed/commentPost" element={<CommentPost />} />
                <Route path="/users/feed/commentEvent" element={<CommentEvent />} />
                <Route path="/users/feed/commentUrgentPost" element={<CommentUrgentPost />} />


            </Routes>
    );
}

export default AllRoutes