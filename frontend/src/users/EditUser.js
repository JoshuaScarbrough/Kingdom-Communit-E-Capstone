import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import styles from "./EditUser.module.css";  // Import the module CSS

/** 
 * Route for a User to be able to edit their profile.
 * Form style similar to the login and register routes.
 */

function EditUser(){
    const navigate = useNavigate();

    // Get the token from sessionStorage and decode it
    const token = sessionStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const userId = decoded ? decoded.id : null;

    // Initialize user and updatedUser states.
    // Note: user is null until the API returns data. We are setting an empty state as well that we will later populate with data.
    const [user, setUser] = useState(null);
    const [updatedUser, setUpdatedUser] = useState({
        username: "",
        bio: "",
        address: "",
    });

    // We'll use this to indicate whether we've already loaded the fetched user into updatedUser.
    const [dataLoaded, setDataLoaded] = useState(false);

    // Fetch the user data once when the component mounts or if userId changes.
    useEffect(() => {

      // Makes sure that if there is no token you are re-routed back to the homepage
      if(token == null){
        alert("Please Login")
        navigate("/")
        return; // Stops further execution
      }
        async function getUser() {
        try {
            // Makes a call to the API that gets the user
            const response = await axios.post("http://localhost:5000/users", {
            id: userId,
            });

            const fetchedUser = response.data[0];
            console.log("Fetched user:", fetchedUser);
        setUser(fetchedUser);
      } catch (error) {
        console.error("Error fetching the user:", error);
      }
    }

    // If there is a token then get the User
    if (userId) {
      getUser();
    }
  }, [userId]);

  // Once the user data is fetched, update updatedUser only once.
  useEffect(() => {
    if (user && !dataLoaded) {
        console.log(user)
      setUpdatedUser({
        username: user.username || "",
        bio: user.bio || "",
        address: user.useraddress || "", // this will be used in your input
      });
      setDataLoaded(true);
      console.log("Initialized updatedUser with address:", user.useraddress);
    }
  }, [user, dataLoaded]);



    /** 
    * setUser responds with an object of the [name]: value pairs that is saved as the user.
    * This handle change is fired everytime the input box is manipulated by the user. 
    */
    function handleChange(evt) {
        const { name, value } = evt.target;
        setUpdatedUser(data => ({ ...data, [name]: value }));
    }


    async function handleSubmit(evt) {
        evt.preventDefault();
        console.log(updatedUser)
        
          const response = await axios.patch(`http://localhost:5000/users/${userId}/update`, {
            token,
            updatedUser,
          });
          console.log(response.data.user)
    
          alert(response.data.message)
          sessionStorage.setItem("token", response.data.token)
          console.log("Stored Token:", sessionStorage.getItem("token"))
          
          // Need to refine this to be more RESTFUL
           navigate("/users");
      }


return (
    <div className={styles.editUserPage}>
      {/* Navigation / Header Section */}
      <section>
        <h1>Kingdom Communnit-E</h1>
        <button onClick={() => navigate("/users")}>Back</button>
      </section>

      {/* Edit Title Section */}
      <section>
        <h3>Edit User</h3>
      </section>

      {/* Form Section */}
      <section>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input 
              type="text"
              name="username"
              value={updatedUser.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Bio:</label>
            <input
              type="text"
              name="bio"
              value={updatedUser.bio}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={updatedUser.address}
              onChange={handleChange}
            />
          </div>

          <button type="submit">Update User</button>
        </form>
      </section>
    </div>
  );
}

export default EditUser;