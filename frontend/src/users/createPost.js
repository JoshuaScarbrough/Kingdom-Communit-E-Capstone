import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

/** 
 * Route that allows users to be able to create all types of posts based upon what they choose
 */

function CreatePost() {
    const navigate = useNavigate();
  
    // Get the token from sessionStorage and decode it.
    const token = sessionStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const userId = decoded ? decoded.id : null;
  
    // Initialize state for creating posts.
    const [createPost, setCreatePost] = useState({
      post: "",
      imageurl: "",
    });

    // Initialize state for creating events.
    const [createEvent, setCreateEvent] = useState({
        post: "",
        imageurl: "",
        userLocation: "",
    });

    // Initialize state for creating UrgentPosts.
    const [createUrgentPost, setCreateUrgentPosts] = useState({
        post: "",
        imageurl: "",
        userLocation: "",
    });
  
    /** 
     * Updates state every time the input box is manipulated by the user.
     * The data is coming in as an object and thats why we need the {} with the spread operator to be able to handle that
     */
    function handleChangePost(event) {
        const { name, value } = event.target;
        setCreatePost(data => ({ ...data, [name]: value }));
    }

    function handleChangeEvent(event) {
        const { name, value } = event.target;
        setCreateEvent(data => ({ ...data, [name]: value }));
    }

    function handleChangeUrgentPost(event) {
        const { name, value } = event.target;
        setCreateUrgentPosts(data => ({ ...data, [name]: value }));
    }
  
    // Allows the post to be created
    async function handleSubmitPost(event) {
      event.preventDefault();
  
      try {
        const response = await axios.post(`http://localhost:5000/posts/${userId}`,
          { token, ...createPost }, // Send token along with post data
          { headers: { "Content-Type": "application/json" } } 
        );
  
        alert(response.data.message)
        navigate("/users")
      } catch (error) {
        console.error("Error creating post:", error);
      }
    }

    // Allows the event to be created
    async function handleSubmitEvent(event) {
        event.preventDefault();

        try {

            const response = await axios.post(`http://localhost:5000/events/${userId}`, 
                { token, ...createEvent }, // Send token along with post data
                { headers: {"Content-Type": "application/json" } }
            );

          alert(response.data.message)
          navigate("/users")
        }catch (error) {
         console.error("Error creating post:", error);
        }
    }


    // Allows the Urgent Post to be created
    async function handleSubmitUrgentPost(event) {
        event.preventDefault();

        try {

            const response = await axios.post(`http://localhost:5000/urgentPosts/${userId}`, 
                { token, ...createUrgentPost }, // Send token along with post data
                { headers: {"Content-Type": "application/json" } }
            );

          alert(response.data.message)
          navigate("/users")
        }catch (error) {
         console.error("Error creating post:", error);
        }
    }

    // Helps user navigate back to the homepage
    const handleClick = () => {
        navigate('/users')
      }
  
    return (
      <div>

        <section>
          <h1>Kingdom Communit-E</h1>
          <button onClick={handleClick}> Back </button>
        </section>
  
        <section>
          <form onSubmit={handleSubmitPost}>
            <h3>Post Form</h3>
  
            <label> Post: </label>
            <input 
              type="text"
              name="post"
              value={createPost.post}
              onChange={handleChangePost}
            />
  
            <label> Image URL: </label>
            <input 
              type="text"
              name="imageurl"
              value={createPost.imageurl}
              onChange={handleChangePost}
            />
  
            <button type="submit">Add Post</button>
          </form>
        </section>

        <section>
            <form onSubmit={handleSubmitEvent}>
                <h3>Event Form</h3>
  
                <label> Event: </label>
                <input 
                  type="text"
                  name="post"
                  value={createEvent.post}
                  onChange={handleChangeEvent}
                />
  
                <label> Image URL: </label>
                <input 
                  type="text"
                  name="imageurl"
                  value={createEvent.imageurl}
                  onChange={handleChangeEvent}
                />

                <label> Location: </label>
                <input 
                  type="text"
                  name="userLocation"
                  value={createEvent.userLocation}
                  onChange={handleChangeEvent}
                />
  
                <button type="submit">Add Event</button>
          </form>
        </section>

        <section>
            <form onSubmit={handleSubmitUrgentPost}>
                <h3>Urgent Post Form</h3>
  
                <label> Urgent Post: </label>
                <input 
                  type="text"
                  name="post"
                  value={createUrgentPost.post}
                  onChange={handleChangeUrgentPost}
                />
  
                <label> Image URL: </label>
                <input 
                  type="text"
                  name="imageurl"
                  value={createUrgentPost.imageurl}
                  onChange={handleChangeUrgentPost}
                />

                <label> Location: </label>
                <input 
                  type="text"
                  name="userLocation"
                  value={createUrgentPost.userLocation}
                  onChange={handleChangeUrgentPost}
                />
  
                <button type="submit">Add Urgent Post</button>
          </form>
        </section>

      </div>
    );
  }
  
  export default CreatePost;