import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate, useLocation } from "react-router-dom";


function CommentEvent(){
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

        const {event, comments} = location.state || {};
        const eventId = event.id
        const eventEvent = event.post
        const eventDate = event.dateposted
        const eventTime = event.timeposted

        // Initialize state for creating posts.
        const [commentEvent, setCommentEvent] = useState({
            comment: "",
        });

        function handleCommentEvent(event) {
            const { name, value } = event.target;
            setCommentEvent(data => ({ ...data, [name]: value }));
        }

        async function handleSubmitComment(evt){
            evt.preventDefault();

            try {

                const response = await axios.post(`http://localhost:5000/events/${userId}/commentEvent`, 
                    { token, eventId , ...commentEvent}, 
                    { headers: {"Content-Type": "application/json" } }
                );

               
            alert("Event has been commented on")
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
                    <h2> Comment on Event </h2>
                    <div>
                        <p> Event: {eventEvent} </p>
                        <p> Date Posted: {eventDate} </p>
                        <p> Time Posted: {eventTime} </p>
                    </div>
        
                </section>

                <section>
                    <form onSubmit={handleSubmitComment}>
                        <h3> Comment on Event </h3>

                        <label> Comment: </label>
                        <input 
                        type="text"
                        name="comment"
                        value={commentEvent.comment}
                        onChange={handleCommentEvent}
                        />

                        <button> Comment </button>
                    </form>
                </section>
            
            </div>
        )
}

export default CommentEvent