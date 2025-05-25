import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate, useLocation } from "react-router-dom";


function CommentUrgentPost(){
        const navigate = useNavigate();
        const location = useLocation();

        // Get the token from sessionStorage and decode it.
        const token = sessionStorage.getItem("token");
        const decoded = token ? jwtDecode(token) : null;
        const userId = decoded ? decoded.id : null;

        // Makes sure that if there is no token you are re-routed back to the homepage
        if(token == null){
            alert("Please Login")
            navigate("/")
        }

        const {UrgentPost} = location.state || {};
        const urgentPostId = UrgentPost.id
        const urgentPostPost = UrgentPost.post
        const urgentPostDate = UrgentPost.dateposted
        const urgentPostTime = UrgentPost.timeposted

        // Initialize state for creating posts.
        const [commentUrgentPost, setCommentUrgentPost] = useState({
            comment: "",
        });

        function handleCommentUrgentPost(event) {
            const { name, value } = event.target;
            setCommentUrgentPost(data => ({ ...data, [name]: value }));
        }

        async function handleSubmitComment(event){
            event.preventDefault();

            try {

                const response = await axios.post(`http://localhost:5000/urgentPosts/${userId}/commentUrgentPost`, 
                    { token, urgentPostId , ...commentUrgentPost},
                    { headers: {"Content-Type": "application/json" } }
                );
    
            alert("Urgent Post has been commented on")
            navigate("/users/feed")
            }catch (error) {
             console.error("Error creating post:", error);
            }
        }

        return(
            <div>
                <section>
                    <h1> Kingdom Communit-E </h1>
                    <button> Back </button>
                </section>

                <section>
                    <h2> Comment on Urgent Post </h2>
                    <div>
                        <p> Urgent Post: {urgentPostPost} </p>
                        <p> Date Posted: {urgentPostDate} </p>
                        <p> Time Posted: {urgentPostTime} </p>
                    </div>
        
                </section>

                <section>
                    <form onSubmit={handleSubmitComment}>
                        <h3> Comment on Urgent Post </h3>

                        <label> Comment: </label>
                        <input 
                        type="text"
                        name="comment"
                        value={commentUrgentPost.comment}
                        onChange={handleCommentUrgentPost}
                        />

                        <button> Comment </button>
                    </form>
                </section>
            
            </div>
        )
}

export default CommentUrgentPost