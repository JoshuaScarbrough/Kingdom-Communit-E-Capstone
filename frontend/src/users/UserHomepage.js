import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

/**
 * Route for a users Homepage
 * 
 * Routed at users/:id/homepage
 */

function UserHomepage() {

    const navigate = useNavigate();

    // The different pieces of (User)state that are used to handle the different peices of data that are on the page.
    const [username, setUsername] = useState(null);
    const [bio, setBio] = useState(null);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [profilePic, setProfilePic] = useState(null);

    // The different pieces of (Post)state that are used to handle the different peices of data that are on the page.
    const [posts, setPosts] = useState(null);
    const [events, setEvents] = useState(null);
    const [urgentPosts, setUrgentPosts] = useState(null);
    
    // The token is grabbed out of the sessionStorage, then decoded and the userId is grabbed out to put into the parameter string for the api request
    const token = sessionStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const userId = decoded ? decoded.id : null;


    // Handles the Following Button
    const handleClickFollowing = (evt) => {
        evt.preventDefault();
        console.log("Following Button was clicked.")
        navigate("/users/following")
        
    }

    // Handles the Followers Button
    const handleClickFollowers = (evt) => {
        evt.preventDefault();
        console.log("Followers Button was clicked.")
        navigate("/users/followers")
        
    }

    // Takes you to a form where you will be able to create a post
    const handleClickCreatePost = (evt) => {
        evt.preventDefault();
        console.log("We are going to be adding a Post here")
        navigate("/users/createPost")
    }


    // The useEffect runs when the page is rendered
    useEffect(() => {

        // This async function calls the API
        const fetchHomepageData = async () => {

            let response = await axios.post(`http://localhost:5000/users/${userId}/homepage`, {
                token
            })

            response = response.data

            // Gets the user to be able to get specific data about them 
            const user = response.user
            
            // The specific data for the user
            const username = user.username
            const bio = user.bio
            const coverPhoto = user.coverPhoto
            const profilepictureurl = user.profilePic
            setUsername(username)
            setBio(bio)
            setCoverPhoto(coverPhoto)
            setProfilePic(profilepictureurl)

                // Gets all the users post to be able to get the specific posts
                const allPosts = response.allPosts
                console.log(allPosts)

                // Gets the specific posts
                let posts = allPosts.posts

                if(posts){
                    // Map over each post in the posts array.
                const mappedPosts = posts.map((postItem) => {
                    const { post, comments } = postItem;

                // Use Array.flat() to flatten the nested comments.
                // If flat() is not supported, you can use reduce instead.
                const flatComments = Array.isArray(comments)
                    ? comments.flat()
                    : [];

                // Map over the flattened comments array.
                const mappedComments = flatComments.map((commentItem) => {
                const commentUserId = commentItem.id
                const commentData = commentItem.comment;
                const commentDate = commentItem.dateposted
                const commentTime = commentItem.timeposted

                // Async Function to get a user
                const getCommentedUser = async () => {
                // This gets the commenters username
                let commentUser = await axios.post(`http://localhost:5000/users`, {
                    id:commentUserId
                })

                commentUser = commentUser.data

                const commentUserUsername = commentUser[0].username

                return(commentUserUsername)
                }
        

                // Only render if commentData exists.
                return commentData ? (

                    <ul>
                        <li key={commentItem.id}>
                        User: {getCommentedUser()},
                        Comment: {commentData},
                        Date Posted: {commentDate},
                        Time Posted: {commentTime}
                        </li>
                    </ul>
                    ) : null;
                });

                return (
                    <div key={post.id} className="post">
                        <h1> {username} Post </h1>
                        <h3>{post.post}</h3>
                        <button> See Post </button>
                        <p> Date Posted: {post.dateposted} </p>
                        <p> Time Posted: {post.timeposted} </p>
                        <p> Number of Likes: {post.numlikes} </p>
                        <p> Number of Comments: {post.numcomments} </p>
                        <h4>Comments:</h4>
                    {mappedComments.length > 0 ? (
                        <ul>{mappedComments}</ul>
                    ) : (
                        <p>No comments available</p>
                    )}
                    </div>
                );
                });

                setPosts(mappedPosts)
                }else{
                    console.log("Nevermind")
                }

                        // Gets the specific events
                        const events = allPosts.events

                        if(events){
                            // Map over each event in the events array.
                        const mappedEvents = events.map((eventItem) => {
                            const { event, comments } = eventItem;

                        // Use Array.flat() to flatten the nested comments.
                        // If flat() is not supported, you can use reduce instead.
                        const flatComments = Array.isArray(comments)
                        ? comments.flat()
                        : [];

                        // Map over the flattened comments array.
                        const mappedComments = flatComments.map((commentItem) => {
                        const commentUserId = commentItem.user_id
                        const commentData = commentItem.comment
                        const commentDate = commentItem.dateposted
                        const commentTime = commentItem.timeposted

                        // Async Function to get a user
                        const getCommentedUser = async () => {
                        // This gets the commenters username
                        let commentUser = await axios.post(`http://localhost:5000/users`, {
                        id:commentUserId
                        })

                        commentUser = commentUser.data

                        const commentUserUsername = commentUser[0].username

                        return(commentUserUsername)
                        }

                        // Only render if commentData exists.
                        return commentData ? (

                        <ul>
                            <li key={commentItem.id}>
                            User: {getCommentedUser()},
                            Comment: {commentData},
                            Date Posted: {commentDate},
                            Time Posted: {commentTime}
                            </li>
                        </ul>
                        ) : null;
                        });

                        return (
                            <div key={event.id} className="event">
                                <h1> {username} Events </h1>
                                <h3>{event.post}</h3>
                                <button> See Event </button>
                                <p> Date Posted: {event.dateposted} </p>
                                <p> Time Posted: {event.timeposted} </p>
                                <p> Event Location: {event.userlocation} </p>
                                <p> Number of Likes: {event.numlikes} </p>
                                <p> Number of Comments: {event.numcomments} </p>
                                <h4>Comments:</h4>
                            {mappedComments.length > 0 ? (
                                <ul>{mappedComments}</ul>
                            ) : (
                                <p>No comments available</p>
                            )}
                            </div>
                        );
                        });

                        setEvents(mappedEvents)
                        }else{
                            console.log("Nevermind")
                        }

                        


                    // Gets the specific events
                    const urgentPosts = allPosts.urgentPosts

                    // Map over each event in the events array.
                    if(urgentPosts){
                        const mappedUrgentPosts = urgentPosts.map((urgentItem) => {
                            const { UrgentPost, comments } = urgentItem;
        
                            // Use Array.flat() to flatten the nested comments.
                            // If flat() is not supported, you can use reduce instead.
                            const flatComments = Array.isArray(comments)
                            ? comments.flat()
                            : [];
        
                            // Map over the flattened comments array.
                            const mappedComments = flatComments.map((commentItem) => {
                            const commentUserId = commentItem.user_id
                            const commentData = commentItem.comment;
                            const commentDate = commentItem.dateposted
                            const commentTime = commentItem.timeposted
        
                            // Async Function to get a user
                            const getCommentedUser = async () => {
                            // This gets the commenters username
                            let commentUser = await axios.post(`http://localhost:5000/users`, {
                            id:commentUserId
                            })
        
                            commentUser = commentUser.data
        
                            const commentUserUsername = commentUser[0].username
        
                            return(commentUserUsername)
                                }
        
                                // Only render if commentData exists.
                                return commentData ? (
        
                                <ul>
                                    <li key={commentItem.id}>
                                    User: {getCommentedUser()},
                                    Comment: {commentData},
                                    Date Posted: {commentDate},
                                    Time Posted: {commentTime}
                                    </li>
                                </ul>
                                ) : null;
                                });

        
                                return (
                                    <div key={UrgentPost.id} className="urgent">
                                        <h1> {username} Urgent Posts </h1>
                                        <h3>{UrgentPost.post}</h3>
                                        <button> See Urgent Post </button>
                                        <p> Date Posted: {UrgentPost.dateposted} </p>
                                        <p> Time Posted: {UrgentPost.timeposted} </p>
                                        <p> Location: {UrgentPost.userlocation} </p>
                                        <p> Number of Comments: {UrgentPost.numcomments} </p>
                                        <h4>Comments:</h4>
                                    {mappedComments.length > 0 ? (
                                        <ul>{mappedComments}</ul>
                                    ) : (
                                        <p>No comments available</p>
                                    )}
                                    </div>
                                );
                                });

                                setUrgentPosts(mappedUrgentPosts)
                    }else{
                        console.log("Nevermind")
                    }
                    

                        
            
    }

    // Call the async function.
    fetchHomepageData();

    }, [])
    

    return(
        <div>

            <img src={coverPhoto} alt="Cover Photo" width="200" height="200"></img>

            <section>

                <a href="/users/edit"> <h1> {username} </h1> </a>
    
                <a href="/users/editPics"> <img src={profilePic} alt="Profile Picture" width="200" height="200"></img> </a> 
            
                <input type="button" value="Users Following" onClick={handleClickFollowing}></input>
                <input type="button" value="Users Followers" onClick={handleClickFollowers}></input>
                <input type="button" value="Create Post" onClick={handleClickCreatePost}></input>

            </section>

            <section>
                <h4> User Bio: </h4>
                <p> {bio} </p>
            </section>

            <section>
                <div>
                    {posts}
                </div>

                <div>
                    {events}
                </div>

                <div>
                    {urgentPosts}
                </div>
            </section>
            
        </div>
    )


}


export default UserHomepage;