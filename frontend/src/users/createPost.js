import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import styles from "./createPost.module.css";

function CreatePost() {
  const navigate = useNavigate();

  // Get the token from sessionStorage and decode it.
  const token = sessionStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const userId = decoded ? decoded.id : null;

  // If there is no token, redirect to the homepage.
  if (token == null) {
    alert("Please Login");
    navigate("/");
  }

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

  // Updates state for the Post form.
  function handleChangePost(event) {
    const { name, value } = event.target;
    setCreatePost((data) => ({ ...data, [name]: value }));
  }

  // Updates state for the Event form.
  function handleChangeEvent(event) {
    const { name, value } = event.target;
    setCreateEvent((data) => ({ ...data, [name]: value }));
  }

  // Updates state for the Urgent Post form.
  function handleChangeUrgentPost(event) {
    const { name, value } = event.target;
    setCreateUrgentPosts((data) => ({ ...data, [name]: value }));
  }

  // Allows the Post to be created.
  async function handleSubmitPost(event) {
    event.preventDefault();

    try {
      const response = await axios.post(
        `http://localhost:5000/posts/${userId}`,
        { token, ...createPost }, // Send token along with post data
        { headers: { "Content-Type": "application/json" } }
      );
      alert(response.data.message);
      navigate("/users");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  }

  // Allows the Event to be created.
  async function handleSubmitEvent(event) {
    event.preventDefault();

    try {
      const response = await axios.post(
        `http://localhost:5000/events/${userId}`,
        { token, ...createEvent },
        { headers: { "Content-Type": "application/json" } }
      );
      alert(response.data.message);
      navigate("/users");
    } catch (error) {
      console.error("Error creating event:", error);
    }
  }

  // Allows the Urgent Post to be created.
  async function handleSubmitUrgentPost(event) {
    event.preventDefault();

    try {
      const response = await axios.post(
        `http://localhost:5000/urgentPosts/${userId}`,
        { token, ...createUrgentPost },
        { headers: { "Content-Type": "application/json" } }
      );
      alert(response.data.message);
      navigate("/users");
    } catch (error) {
      console.error("Error creating urgent post:", error);
    }
  }

  // Allows user to navigate back to the homepage.
  const handleClick = () => {
    navigate("/users");
  };

  return (
    <div className={styles.createPostPage}>
      {/* Navigation / Header Section */}
      <section className={styles.navSection}>
        <h1>Kingdom Communit-E</h1>
        <button onClick={handleClick}>Back</button>
      </section>

      {/* Post Form Section */}
      <section className={styles.formSection}>
        <form onSubmit={handleSubmitPost}>
          <h3>Post Form</h3>
          <div className={styles.formGroup}>
            <label>Post:</label>
            <input
              type="text"
              name="post"
              value={createPost.post}
              onChange={handleChangePost}
            />
          </div>
          <button type="submit">Add Post</button>
        </form>
      </section>

      {/* Event Form Section */}
      <section className={styles.formSection}>
        <form onSubmit={handleSubmitEvent}>
          <h3>Event Form</h3>
          <div className={styles.formGroup}>
            <label>Event:</label>
            <input
              type="text"
              name="post"
              value={createEvent.post}
              onChange={handleChangeEvent}
            />
          </div>
         
          <div className={styles.formGroup}>
            <label>Location:</label>
            <input
              type="text"
              name="userLocation"
              value={createEvent.userLocation}
              onChange={handleChangeEvent}
            />
          </div>
          <button type="submit">Add Event</button>
        </form>
      </section>

      {/* Urgent Post Form Section */}
      <section className={styles.formSection}>
        <form onSubmit={handleSubmitUrgentPost}>
          <h3>Urgent Post Form</h3>
          <div className={styles.formGroup}>
            <label>Urgent Post:</label>
            <input
              type="text"
              name="post"
              value={createUrgentPost.post}
              onChange={handleChangeUrgentPost}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Location:</label>
            <input
              type="text"
              name="userLocation"
              value={createUrgentPost.userLocation}
              onChange={handleChangeUrgentPost}
            />
          </div>
          <button type="submit">Add Urgent Post</button>
        </form>
      </section>
    </div>
  );
}

export default CreatePost;