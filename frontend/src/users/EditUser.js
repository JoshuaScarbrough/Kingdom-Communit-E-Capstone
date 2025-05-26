import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import styles from "./EditUser.module.css";  // Import the module CSS

/** 
 * Route for a User to be able to edit their profile.
 * Form style similar to the login and register routes.
 * 
 * Fun fact: This component was a bit tricky to test because of how the loading state works
 * Had to make sure our mocks were set up just right so the useEffect would actually run
 */

function EditUser(){
    const navigate = useNavigate();

    // Get the token from sessionStorage and decode it
    // This part was causing test issues - needed to mock jwtDecode properly
    const token = sessionStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const userId = decoded ? decoded.id : null;

    // Initialize user and updatedUser states
    const [user, setUser] = useState(null);
    const [updatedUser, setUpdatedUser] = useState({
        username: "",
        bio: "",
        address: "",
    });

    // We'll use this to indicate whether we've already loaded the fetched user into updatedUser
    // This loading state was the main culprit in our test failures - it would never resolve!
    const [isLoading, setIsLoading] = useState(true);

    // Fetch the user data once when the component mounts or if userId changes
    useEffect(() => {
        // Makes sure that if there is no token you are re-routed back to the homepage
        if(token == null){
            alert("Please Login");
            navigate("/");
            return;
        }

        async function getUser() {
            try {
                // Makes a call to the API that gets the user
                // This axios.post call needed proper mocking in tests
                const response = await axios.post("http://localhost:5000/users", {
                    id: userId,
                });

                // The component expects response.data to be an array, hence the [0]
                // This detail was important for setting up the test mocks correctly
                const fetchedUser = response.data[0];
                setUser(fetchedUser);
                
                // Update the form data immediately when we get the user
                setUpdatedUser({
                    username: fetchedUser.username || "",
                    bio: fetchedUser.bio || "",
                    address: fetchedUser.useraddress || "", // Note: it's useraddress, not address!
                });
                setIsLoading(false); // This is what finally gets us out of loading state
            } catch (error) {
                console.error("Error fetching the user:", error);
                setIsLoading(false); // Make sure we exit loading state even on error
            }
        }

        // Only call getUser if we have a userId - this was crucial for the tests
        if (userId) {
            getUser();
        }
    }, [userId, token, navigate]);

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
        
        try {
            const response = await axios.patch(`http://localhost:5000/users/${userId}/update`, {
                token,
                updatedUser,
            });
            
            alert(response.data.message);
            sessionStorage.setItem("token", response.data.token);
            navigate("/users");
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Error updating user");
        }
    }

    // This loading check was the source of our test timeouts before we fixed the mocks
    if (isLoading) {
        return <div>Loading...</div>;
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
                        <label htmlFor="username">Username:</label>
                        <input 
                            id="username"
                            type="text"
                            name="username"
                            value={updatedUser.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="bio">Bio:</label>
                        <input
                            id="bio"
                            type="text"
                            name="bio"
                            value={updatedUser.bio}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="address">Address:</label>
                        <input
                            id="address"
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