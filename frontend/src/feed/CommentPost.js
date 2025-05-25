import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate, useLocation } from "react-router-dom";


function CommentPost(){
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

        const {post, comments} = location.state || {};
        const postId = post.id
        const postPost = post.post
        const postDate = post.dateposted
        const postTime = post.timeposted

        // Initialize state for creating posts.
        const [commentPost, setCommentPost] = useState({
            comment: "",
        });

        function handleCommentPost(event) {
            const { name, value } = event.target;
            setCommentPost(data => ({ ...data, [name]: value }));
        }

        async function handleSubmitComment(event){
            event.preventDefault();

            try {

                const response = await axios.post(`http://localhost:5000/posts/${userId}/commentPost`, 
                    { token, postId , ...commentPost}, // Send token along with post data
                    { headers: {"Content-Type": "application/json" } }
                );
    
              alert("Post has been commented on")
              navigate("/users/feed")
            }catch (error) {
             console.error("Error creating post:", error);
            }
        }

        // Function to allow a user to go back to their feed
        async function visitUserFeed(evt){
            evt.preventDefault();

            navigate("/users/feed")
        }

        return(
            <div>
                <section>
                    <h1> Kingdom Communit-E </h1>
                    <button onClick={visitUserFeed}> Back </button>
                </section>

                <section>
                    <h2> Comment on Post </h2>
                    <div>
                        <p> Post: {postPost} </p>
                        <p> Date Posted: {postDate} </p>
                        <p> Time Posted: {postTime} </p>
                    </div>
        
                </section>

                <section>
                    <form onSubmit={handleSubmitComment}>
                        <h3> Comment on Post </h3>

                        <label> Comment: </label>
                        <input 
                        type="text"
                        name="comment"
                        value={commentPost.comment}
                        onChange={handleCommentPost}
                        />

                        <button> Comment </button>
                    </form>
                </section>
            
            </div>
        )
}

export default CommentPost