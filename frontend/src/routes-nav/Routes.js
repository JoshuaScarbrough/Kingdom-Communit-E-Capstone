import React from "react";
import { Router, Routes, Route } from "react-router-dom";
import Homepage from "../homepage/Homepage.js";
import RegisterForm from "../auth/RegisterForm.js"
import LoginForm from "../auth/LoginForm.js";
import UserHomepage from "../users/UserHomepage.js";
import EditUser from "../users/EditUser.js";
import UsersFollowing from "../following-followers/Following.js";
import UsersFollowers from "../following-followers/Followers.js";
import CreatePost from "../users/createPost.js";
import EditUserPics from "../users/EditUserPics.js";
import UserFeed from "../feed/UsersFeed.js";
import CommentPost from "../feed/CommentPost.js";
import CommentEvent from "../feed/commentEvent.js";
import CommentUrgentPost from "../feed/commentUrgentPost.js";
import VisitingUsersHomepage from "../users/VisitingUserHomepage.js";


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
                <Route path="/users/visitUser" element={<VisitingUsersHomepage />} />

            </Routes>
    );
}

export default AllRoutes