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
    const [likedPosts, setLikedPost] = useState(null);
    const [likedEvents, setLikedEvents] = useState(null);
    
    // The token is grabbed out of the sessionStorage, then decoded and the userId is grabbed out to put into the parameter string for the api request
    const token = sessionStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const userId = decoded ? decoded.id : null;


    // Handles the Following Button
    const handleClickFollowing = (evt) => {
        evt.preventDefault();
        navigate("/users/following")
        
    }

    // Handles the Followers Button
    const handleClickFollowers = (evt) => {
        evt.preventDefault();
        navigate("/users/followers")
        
    }

    // Takes you to a form where you will be able to create a post
    const handleClickCreatePost = (evt) => {
        evt.preventDefault();
        navigate("/users/createPost")
    }

    // Takes you to the users Feed
    const handleClickFeed = (evt) => {
        evt.preventDefault();
        navigate("/users/feed")
    }


    // The useEffect runs when the page is rendered
    useEffect(() => {

        // This async function calls the API
        const fetchHomepageData = async () => {

            // This brings up the users homepage data. Only gets the user info along with the users posts. Does not get a users liked posts
            let userPosts = await axios.post(`http://localhost:5000/users/${userId}/homepage`, {
                token
            })
            userPosts = userPosts.data

            // This gets a users liked posts to display on the users homepage
            let userLikedPosts = await axios.post(`http://localhost:5000/likedPosts/${userId}`, {
                token
            })
            userLikedPosts = userLikedPosts.data

            // This gets a users liked events to display on the users homepage
            let userLikedEvents = await axios.post(`http://localhost:5000/likedEvents/${userId}`, {
                token
            })
            userLikedEvents = userLikedEvents.data            

            // Gets the user to be able to get specific data about them 
            const user = userPosts.user
            
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
                const allPosts = userPosts.allPosts

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

                // This is so that when you click the button to see the post you can pull it up
                async function handleClickDeletePost(event){
                    event.preventDefault();
                    const postId = post.id

                    try {
                        let response = await axios.delete(`http://localhost:5000/posts/${userId}`, {
                          headers: { "Content-Type": "application/json" },
                          data: { token, postId } // Pass token and post.id in the data property
                        });
                        
                        console.log(response.data.message);
                        alert(response.data.message);
                        window.location.href = "/users";
                      } catch (error) {
                        console.error("Error deleting post:", error.response?.data || error.message);
                      }
                }

                return (
                    <div key={post.id} className="post">
                        <h1> {username} Post </h1>
                        <h3>{post.post}</h3>
                        <button onClick={handleClickDeletePost}> Delete Post </button>
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

                        // This is so that when you click the button to see the post you can pull it up
                        async function handleClickDeleteEvent(evt){
                            evt.preventDefault();
                            const eventId = event.id

                            try {
                                let response = await axios.delete(`http://localhost:5000/events/${userId}`, {
                                headers: { "Content-Type": "application/json" },
                                data: { token, eventId } // Pass token and event.id in the data property
                            });
                        
                            alert(response.data.message);
                            window.location.href = "/users";
                            } catch (error) {
                            console.error("Error deleting event:", error.response?.data || error.message);
                            }
                        }   

                        return (
                            <div key={event.id} className="event">
                                <h1> {username} Events </h1>
                                <h3>{event.post}</h3>
                                <button onClick={handleClickDeleteEvent}> Delete Event </button>
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

                                 // This is so that when you click the button to see the post you can pull it up
                                async function handleClickDeleteUrgentEvents(event){
                                    event.preventDefault();
                                    const urgentPostId = UrgentPost.id

                                    try {
                                        let response = await axios.delete(`http://localhost:5000/urgentPosts/${userId}`, {
                                        headers: { "Content-Type": "application/json" },
                                        data: { token, urgentPostId } // Pass token and urgentPost.id in the data property
                                    });
                        
                                    alert(response.data.message);
                                    window.location.href = "/users";
                                    } catch (error) {
                                    console.error("Error deleting Urgent Post:", error.response?.data || error.message);
                                    }
                                }   
        
                                return (
                                    <div key={UrgentPost.id} className="urgent">
                                        <h1> {username} Urgent Posts </h1>
                                        <h3>{UrgentPost.post}</h3>
                                        <button onClick={handleClickDeleteUrgentEvents}> Delete Urgent Post </button>
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

                    // This gets a users liked Posts 
                    const likedPostsArr = userLikedPosts.posts
                    if(likedPostsArr){
                        const mappedLikedPosts = likedPostsArr.map((postsItem) => {
                            const { post, comments } = postsItem; 

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

                            // This is so that you can remove a post from your liked Posts
                            async function handleUnlikePost(event){
                                event.preventDefault();
                                const postId = post.id

                                try {
                                    let response = await axios.delete(`http://localhost:5000/posts/${userId}/unlikePost`, {
                                    headers: { "Content-Type": "application/json" },
                                    data: { token, postId } // Pass token and urgentPost.id in the data property
                                });
                    
                                alert(response.data.message);
                                window.location.href = "/users";
                                } catch (error) {
                                console.error("Error unliking Post:", error.response?.data || error.message);
                                }
                            }  

                            if(post.id){
                                const userId = post.user_id
                                // Async function to get the user for their posts
                                const getPostUser = async () => {
                                    let postUser = await axios.post(`http://localhost:5000/users`, {
                                        id: userId
                                })
                                
                                postUser = postUser.data
        
                                let username = postUser[0]
                                username = username.username
                                
                                return(username)
                                }
                            
                                return (
                                    <div key={post.id} className="likedPost">
                                        <h3> {getPostUser()} Post </h3>
                                        <h5>{post.post}</h5>
                                        <button onClick={handleUnlikePost}> Unlike </button>
                                        <p> Date Posted: {post.dateposted} </p>
                                        <p> Time Posted: {post.timeposted} </p>
                                        <p> Number of Likes {post.numlikes} </p>
                                        <p> Number of Comments: {post.numcomments} </p>
                                        <h4>Comments:</h4>
                                    {mappedComments.length > 0 ? (
                                        <ul>{mappedComments}</ul>
                                    ) : (
                                        <p>No comments available</p>
                                    )}
                                    </div>
                                );
                            
                            };
                            })

                            setLikedPost(mappedLikedPosts)
                    }else{
                        console.log("Nevermind")
                    }

                    // This gets a users liked Events 
                    const likedEventsArr = userLikedEvents.posts
                    if(likedEventsArr){
                        const mappedLikedEvents = likedEventsArr.map((eventsItem) => {
                            const { event, comments } = eventsItem; 

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

                            
                            // This is so that you can remove a event from your liked Events
                            async function handleUnlikeEvent(evt){
                                evt.preventDefault();
                                const eventId = event.id

                                try {
                                    let response = await axios.delete(`http://localhost:5000/events/${userId}/unlikeEvent`, {
                                    headers: { "Content-Type": "application/json" },
                                    data: { token, eventId } // Pass token and urgentPost.id in the data property
                                });
                    
                                alert(response.data.message);
                                window.location.href = "/users";
                                } catch (error) {
                                console.error("Error unliking Event:", error.response?.data || error.message);
                                }
                            }  

                            if(event.id){
                                const userId = event.user_id
                                // Async function to get the user for their posts
                                const getEventUser = async () => {
                                    let eventUser = await axios.post(`http://localhost:5000/users`, {
                                        id: userId
                                })
                                
                                eventUser = eventUser.data
        
                                let username = eventUser[0]
                                username = username.username
                                
                                return(username)
                                }
                            
                                return (
                                    <div key={event.id} className="likedEvent">
                                        <h3> {getEventUser()} Event </h3>
                                        <h5>{event.post}</h5>
                                        <button onClick={handleUnlikeEvent}> Unlike </button>
                                        <p> Date Posted: {event.dateposted} </p>
                                        <p> Time Posted: {event.timeposted} </p>
                                        <p> Number of Likes {event.numlikes} </p>
                                        <p> Number of Comments: {event.numcomments} </p>
                                        <h4>Comments:</h4>
                                    {mappedComments.length > 0 ? (
                                        <ul>{mappedComments}</ul>
                                    ) : (
                                        <p>No comments available</p>
                                    )}
                                    </div>
                                );
                            
                            };
                            })

                            setLikedEvents(mappedLikedEvents)
                    }else{
                        console.log("Nevermind")
                    }
                    

                        
            
    }

    // Call the async function.
    fetchHomepageData();

    }, [])
    

    return(
        <div>

            <section>
                <img src={coverPhoto} alt="Cover Photo" width="200" height="200"></img>
                <a href="/users/edit"> <h1> {username} </h1> </a>
                <a href="/users/editPics"> <img src={profilePic} alt="Profile Picture" width="200" height="200"></img> </a> 
                <input type="button" value="usersFeed" onClick={handleClickFeed}></input>
            </section>

            <section>
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

                <div>
                    <h3> Liked Posts </h3>
                    {likedPosts}
                </div>

                <div>
                    <h3> Liked Events </h3>
                    {likedEvents}
                </div>
            </section>
            
        </div>
    )


}


export default UserHomepage;