import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import "./UserHomepage.css"

/**
 * Route for a users Homepage
 * 
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

    // Toggle state for posts section
    const [showUserPosts, setShowUserPosts] = useState(false);
    const [showLikedPosts, setShowLikedPosts] = useState(false);
    
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

        // Makes sure that if there is no token you are re-routed back to the homepage
        if(token === null){
            alert("Please Login")
            navigate("/")
            return; // Stops further execution
        }

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
                let commentUserUsername = commentUser[0]
                const listOfUsername = commentUserUsername.username

                return(listOfUsername)
                }
        

                // Only render if commentData exists.
                return commentData ? (
                    <ul className="comments-container">
                        <li key={commentItem.id} className="comment">
                        <div className="comment-header">User: {getCommentedUser()}</div>
                        <div className="comment-body">Comment: {commentData}</div>
                        <div className="comment-footer">
                            <span>Date Posted: {commentDate}</span>
                            <span>Time Posted: {commentTime}</span>
                        </div>
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

                        <section className="post-section">   
                            <section>
                                <h2>Post</h2>
                                <h3>{post.post}</h3>
                                <button onClick={handleClickDeletePost}>Delete Post</button>
                            </section>

                            <section>
                                <p>Date Posted: {post.dateposted}</p>
                                <p>Time Posted: {post.timeposted}</p>
                            </section>

                            <section>
                                <p>Likes: {post.numlikes}</p>
                                <p>Comments: {post.numcomments}</p>
                            </section>
                        </section>
                        <h4>Comments</h4>
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
                            <ul className="comments-container">
                                <li key={commentItem.id} className="comment">
                                <div className="comment-header">User: {getCommentedUser()}</div>
                                <div className="comment-body">Comment: {commentData}</div>
                                <div className="comment-footer">
                                    <span>Date Posted: {commentDate}</span>
                                    <span>Time Posted: {commentTime}</span>
                                </div>
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
                            <div key={event.id} className="post">

                                <section className="post-section">   
                                    <section>
                                        <h2>Event</h2>
                                        <h3>{event.post}</h3>
                                        <p> Event Location: {event.userlocation} </p>
                                        <button onClick={handleClickDeleteEvent}> Delete Event </button>
                                    </section>

                                    <section>
                                        <p>Date Posted: {event.dateposted}</p>
                                        <p>Time Posted: {event.timeposted}</p>
                                    </section>

                                    <section>
                                        <p>Likes: {event.numlikes}</p>
                                        <p>Comments: {event.numcomments}</p>
                                    </section>
                                </section>
                                <h4>Comments</h4>
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

                    // Map over each Urgent Post in the Urgent Post array.
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
                                    <ul className="comments-container">
                                        <li key={commentItem.id} className="comment">
                                        <div className="comment-header">User: {getCommentedUser()}</div>
                                        <div className="comment-body">Comment: {commentData}</div>
                                        <div className="comment-footer">
                                            <span>Date Posted: {commentDate}</span>
                                            <span>Time Posted: {commentTime}</span>
                                        </div>
                                        </li>
                                    </ul>
                                    ) : null;
                                });

                                 // This is so that when you click the button to see the post you can pull it up
                                async function handleClickDeleteUrgentPosts(event){
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
                                    <div key={UrgentPost.id} className="post">

                                        <section className="post-section">   
                                            <section>
                                                <h2>Urgent Posts</h2>
                                                <h3>{UrgentPost.post}</h3>
                                                <p> Location: {UrgentPost.userlocation} </p>
                                                <button onClick={handleClickDeleteUrgentPosts}>Delete Post</button>
                                            </section>

                                            <section>
                                                <p>Date Posted: {UrgentPost.dateposted}</p>
                                                <p>Time Posted: {UrgentPost.timeposted}</p>
                                            </section>

                                            <section>
                                                <p>Likes: {UrgentPost.numlikes}</p>
                                                <p>Comments: {UrgentPost.numcomments}</p>
                                            </section>
                                        </section>
                                        <h4>Comments</h4>
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
                                <ul className="comments-container">
                                    <li key={commentItem.id} className="comment">
                                    <div className="comment-header">User: {getCommentedUser()}</div>
                                    <div className="comment-body">Comment: {commentData}</div>
                                    <div className="comment-footer">
                                        <span>Date Posted: {commentDate}</span>
                                        <span>Time Posted: {commentTime}</span>
                                    </div>
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
                            
                            
                            // click button that is going to make a axios request that pulls up the post and navigates to a page that displays the post
                            async function handleCommentPost(event){
                                event.preventDefault()
                                const postId = post.id

                                let response = await axios.post(`http://localhost:5000/posts/${userId}/specificPost`, {
                                    token,
                                    postId
                                })
                                const postData = response.data

                                navigate("/users/feed/commentPost", {state: postData})
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
                                    <h3>{getPostUser()} Post</h3>
                                    <h5>{post.post}</h5>
                                    <div className="button-group">
                                    <button onClick={handleUnlikePost}>Unlike</button>
                                    <button onClick={handleCommentPost}>Comment</button>
                                    </div>
                                    <p>Date Posted: {post.dateposted}</p>
                                    <p>Time Posted: {post.timeposted}</p>
                                    <p>Number of Likes: {post.numlikes}</p>
                                    <p>Number of Comments: {post.numcomments}</p>
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
                                <ul className="comments-container">
                                    <li key={commentItem.id} className="comment">
                                    <div className="comment-header">User: {getCommentedUser()}</div>
                                    <div className="comment-body">Comment: {commentData}</div>
                                    <div className="comment-footer">
                                        <span>Date Posted: {commentDate}</span>
                                        <span>Time Posted: {commentTime}</span>
                                    </div>
                                    </li>
                                </ul>
                            ) : null;
                            });

                            // Get distance from Event
                            async function getDistanceFrom(evt){
                                evt.preventDefault();
                                const eventId = event.id

                                try{
                                    let response = await axios.post(`http://localhost:5000/feed/${userId}/event`, {
                                        token,
                                        eventId
                                })

                                console.log("This is the response from the distance", response.data)
                                alert(response.data)
                                } catch (error){
                                    console.log("There is an error fetching the distance", error)
                                }

                            }

                            
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

                            // click button that is going to make a axios request that pulls up the post and navigates to a page that displays the post
                            async function handleCommentEvent(evt){
                                evt.preventDefault()
                                const eventId = event.id

                                let response = await axios.post(`http://localhost:5000/events/${userId}/specificEvent`, {
                                    token,
                                    eventId
                                })
                                const eventData = response.data

                                navigate("/users/feed/commentEvent", {state: eventData})
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
                                <div key={event.id} className="likedPost">
                                    <h3>{getEventUser()} Post</h3>
                                    <h5>{event.post}</h5>
                                    <div className="button-group">
                                    <button onClick={handleUnlikeEvent}>Unlike</button>
                                    <button onClick={handleCommentEvent}>Comment</button>
                                    </div>
                                    <p>Date Posted: {event.dateposted}</p>
                                    <p>Time Posted: {event.timeposted}</p>
                                    <p>Number of Likes: {event.numlikes}</p>
                                    <p>Number of Comments: {event.numcomments}</p>
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

    // Function to allow a user to Edit their profile
    async function editUser(evt){
        evt.preventDefault();

        navigate("/users/edit")
    }
    

    return(
        <div>

            <section>
                <nav>
                    <h1> Kingdom Communit-E </h1>
                    <Link to="/users/feed"> Feed </Link>
                    <Link to="/"> Logout </Link>
                </nav>
            </section>

            <section>
                <div className="cover-photo-container">
                    <img src={coverPhoto} alt="Cover Photo" className="cover-photo"></img>
                </div>

             <div className="user-section">
                    <div className="user-info">
                        <a href="/users/editPics">
                        <img
                            src={profilePic}
                            alt="Profile Picture"
                            className="profile-picture"
                        />
                        </a>
                        <a href="/users/edit">
                        <h1>{username}</h1>
                        </a>
                    </div>

                    <section className="bio-section">
                        <h4> User Bio: </h4>
                        <p> {bio} </p>
                    </section>

                    <div className="button-group">
                        <input type="button" value="Edit Profile" onClick={editUser} />
                        <input type="button" value="Following" onClick={handleClickFollowing} />
                        <input type="button" value="Followers" onClick={handleClickFollowers} />
                        <input type="button" value="Create Post" onClick={handleClickCreatePost} />
                    </div>

                </div>

            </section>

            
      <section className="toggle-button-container">
        <button
          className="toggle-posts-btn"
          onClick={() => setShowUserPosts(!showUserPosts)}
        >
          {showUserPosts ? "Hide" : "Show"} {username}'s Posts & Events & Urgent Posts
        </button>
      </section>

      {/* Conditionally Render the User's Posts Section */}
      {showUserPosts && (
        <section className="user-posts-section">
          <section>
            <div className="posts-container">
              <h2 className="posts-header">{username}'s Posts</h2>
              {posts}
            </div>
          </section>
          <section>
            <div className="posts-container">
              <h2 className="posts-header">{username}'s Events</h2>
              {events}
            </div>
          </section>
          <section>
            <div className="posts-container">
              <h2 className="posts-header">{username}'s Urgent Posts</h2>
              {urgentPosts}
            </div>
          </section>
        </section>
      )}

      <section className="toggle-button-container">
        <button
          className="toggle-posts-btn"
          onClick={() => setShowLikedPosts(!showLikedPosts)}
        >
          {showLikedPosts ? "Hide" : "Show"} Liked Posts & Events
        </button>
      </section>

      {/* Conditionally Render the Liked Posts Section */}
      {showLikedPosts && (
        <section className="liked-posts-section">
          <div className="posts-container">
            <h2 className="posts-header">Liked Posts</h2>
            {likedPosts}
          </div>
          <div className="posts-container">
            <h2 className="posts-header">Liked Events</h2>
            {likedEvents}
          </div>
        </section>
      )}
    </div>
    )


}


export default UserHomepage;