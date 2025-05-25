import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Followers.module.css"; // using module CSS

function UsersFollowers() {
    const navigate = useNavigate();
  
    // Get the token from sessionStorage and decode it
    const token = sessionStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const userId = decoded ? decoded.id : null;
  
    // Initialize state as an object with default values.
    const [followersData, setFollowersData] = useState({
      followers: [],    // expecting an array of follow objects
      message: ""       // some message from your API
    });
  
    useEffect(() => {

      // Makes sure that if there is no token you are re-routed back to the homepage
      if(token == null){
        alert("Please Login")
        navigate("/")
        return; // Stops further execution
      }

      async function fetchUsersFollowers() {
        if (userId && token) { // check that both token and userId exist
          try {
            const response = await axios.post(
              `http://localhost:5000/follow/${userId}/followers`,
              { token }
            );
            console.log("API response:", response.data);
            setFollowersData(response.data);
          } catch (error) {
            console.error("Error fetching following list:", error);
          }
        } else {
          console.warn("Missing userId or token, skipping API call");
        }
      }
      fetchUsersFollowers();
    }, [userId, token]);
  
    // Safely extract the list of following and map over it.
    // Use optional chaining and a fallback to an empty array.
    const followersList = followersData?.followers || [];
    const mappedUsernames = followersList.map((user) => user.username);
  
    const listItems = mappedUsernames.map((name, index) => (
      <li key={index}>{name}</li>
    ));

    const handleClick = () => {
      navigate('/users')
    }
  
     return (
    <div className={styles.followersPage}>
      <section className={styles.navSection}>
        <h1>Kingdom Communit-E</h1>
        <button className={styles.backBtn} onClick={handleClick}>
          Back
        </button>
      </section>
        
      <section className={styles.followersContainer}>
        <h3>{followersData.message}</h3>
        <ul>{listItems}</ul>
      </section>
    </div>
  );
  }
  
  export default UsersFollowers;