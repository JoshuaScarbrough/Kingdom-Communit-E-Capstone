import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

function UsersFollowing(){
    const navigate = useNavigate();
    
        // Get the token from sessionStorage and decode it
        const token = sessionStorage.getItem("token");
        const decoded = token ? jwtDecode(token) : null;
        const userId = decoded ? decoded.id : null;

        const [following, setFollowing] = useState([]);

        useEffect(() => {
            console.log("userID changed to", userId)
            // This async function calls the API
            async function fetchUserFollowing () {

                if(userId){
                    let response = await axios.post(`http://localhost:5000/follow/${userId}/following`, {
                        token
                    })

                    console.log(response)
                    setFollowing(response.data)
                }
            }
            fetchUserFollowing()

        }, [userId, token])

        // Creates varaible to get the list of following
        const followingList = following.following

        // Maps through the list to just get their username
        const mappedFollowingList = followingList.map(user => user.username);

        // Pulls out the username so that it can display in a list. Uses map to do so
        const listItems = mappedFollowingList.map((name, index) => <li key={index}>{name}</li>);

return(
    <div>
        <h1> Kingdom Communit-E </h1>
        <h3> {following.message} </h3>
        <ul>
            {listItems}
        </ul>
    </div>
)


}

export default UsersFollowing