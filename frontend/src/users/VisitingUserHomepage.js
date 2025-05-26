import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./VisitingUserHomepage.module.css";


function VisitingUsersHomepage(){
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get the token from sessionStorage and decode it.
    const token = sessionStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const userId = decoded ? decoded.id : null;

    // Gets the data that is sent to see the users page
    const { otherUsr, otherUsrPosts, distanceMiles} = location.state || {};

    // Data about the User
    const otherId = otherUsr.id
    const coverPhoto = otherUsr.coverPhoto
    const username = otherUsr.user
    const profilePic = otherUsr.profilePic
    const otherBio = otherUsr.userBio

    // Data that shows the distance between the two Users address
    const distance = distanceMiles

    // Section where we display the posts
    const postArr = otherUsrPosts.posts
    const eventArr = otherUsrPosts.events
    const urgentPostsArr = otherUsrPosts.urgentPosts

    const [posts, setPosts] = useState(null);
    const [events, setEvents] = useState(null);
    const [urgentPosts, setUrgentPosts] = useState(null);


    useEffect(() => {

        // Makes sure that if there is no token you are re-routed back to the homepage
        if(token == null){
            alert("Please Login")
            navigate("/")
            return; // Stops further execution
        }

        // Helps in case there are no posts. Also sets the veiwed users Posts
        if(postArr){
            const mappedPosts = postArr.map((postItem) => {
                const { post, comments } = postItem;
        
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
        
        
                        // Async Function to get a user for their comments
                        const getCommentedUser = async () => {
                        // This gets the commenters username
                        let commentUser = await axios.post(`http://localhost:5000/users`, {
                            id:commentUserId
                        })
            
                        commentUser = commentUser.data
                        commentUser = commentUser[0]
        
                        if(commentUser){
                            const commentUserUsername = commentUser.username
            
                            return(commentUserUsername)
                        }else{
                            console.log("Houston we have a problem")
                        }
                            
                        }    
        
                        // Only render if commentData exists.
                        return commentData ? (
                            <ul className="comments-container">
                                <li key={commentItem.id} className="comment">
                                <div className="comment-body">Comment: {commentData}</div>
                                <div className="comment-footer">
                                    <span>Date Posted: {commentDate}</span>
                                    <span>Time Posted: {commentTime}</span>
                                </div>
                                </li>
                            </ul>
                            ) : null;
                        });
        
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

                            
                            // This is so that you can like a post from your feed
                            async function handleLikePost(event){
                                event.preventDefault();
                                const postId = post.id

                                try {
                                    let response = await axios.post(`http://localhost:5000/posts/${userId}/likePost`, {
                                    headers: { "Content-Type": "application/json" },
                                    token,
                                    postId 
                                });
                    
                                alert("Post has been Liked");
                                window.location.href = "/users/feed";
                                } catch (error) {
                                alert("Post has already been Liked")
                                console.error("Error liking Post:", error.response?.data || error.message);
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
                                        
                            return (
                                <div key={post.id} className="post">

                                    <section className="post-section">   
                                        <section>
                                            <h2>Post</h2>
                                            <h3>{post.post}</h3>
                                            <button onClick={handleLikePost}> Like </button>
                                            <button onClick={handleCommentPost}> Comment </button>
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
        
                        }
        
            });
            setPosts(mappedPosts)
    
        }else(
            console.log("Nevermind")
        )


        if(eventArr){
            const mappedEvents = eventArr.map((postItem) => {
                const { event, comments } = postItem;
        
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
        
        
                        // Async Function to get a user for their comments
                        const getCommentedUser = async () => {
                        // This gets the commenters username
                        let commentUser = await axios.post(`http://localhost:5000/users`, {
                            id:commentUserId
                        })
            
                        commentUser = commentUser.data
                        commentUser = commentUser[0]
        
                        if(commentUser){
                            const commentUserUsername = commentUser.username
            
                            return(commentUserUsername)
                        }else{
                            console.log("Houston we have a problem")
                        }
                            
                        }    
        
                        
                        // Only render if commentData exists.
                        return commentData ? (
                            <ul className="comments-container">
                                <li key={commentItem.id} className="comment">
                                <div className="comment-body">Comment: {commentData}</div>
                                <div className="comment-footer">
                                    <span>Date Posted: {commentDate}</span>
                                    <span>Time Posted: {commentTime}</span>
                                </div>
                                </li>
                            </ul>
                            ) : null;
                        });
        
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

                            // Gets the distance from the Event
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

                            // This is so that you can like a post from your feed
                            async function handleLikeEvent(evt){
                                evt.preventDefault();
                                const eventId = event.id

                                try {
                                    let response = await axios.post(`http://localhost:5000/events/${userId}/likeEvent`, {
                                    headers: { "Content-Type": "application/json" },
                                    token,
                                    eventId
                                });
                    
                                alert("Event has been Liked");
                                window.location.href = "/users/feed";
                                } catch (error) {
                                alert("Event has already been Liked")
                                console.error("Error liking Event:", error.response?.data || error.message);
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

                            return (
                                <div key={event.id} className="post">

                                    <section className="post-section">   
                                        <section>
                                            <h2>Event</h2>
                                            <h3>{event.post}</h3>
                                            <button onClick={handleLikeEvent}> Like </button>
                                            <button onClick={handleCommentEvent}> Comment </button>
                                            <p> Event Location: {event.userlocation} </p>
                                            <button onClick={getDistanceFrom}> See Distance From </button>
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
        
                        }
        
            });
            setEvents(mappedEvents)
    
        }else(
            console.log("Nevermind")
        )


        if(urgentPostsArr){
            const mappedUrgentPosts = urgentPostsArr.map((postItem) => {
                const { UrgentPost, comments } = postItem;
        
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
        
        
                        // Async Function to get a user for their comments
                        const getCommentedUser = async () => {
                        // This gets the commenters username
                        let commentUser = await axios.post(`http://localhost:5000/users`, {
                            id:commentUserId
                        })
            
                        commentUser = commentUser.data
                        commentUser = commentUser[0]
        
                        if(commentUser){
                            const commentUserUsername = commentUser.username
            
                            return(commentUserUsername)
                        }else{
                            console.log("Houston we have a problem")
                        }
                            
                        }    
        
                       
                        // Only render if commentData exists.
                        return commentData ? (
                            <ul className="comments-container">
                                <li key={commentItem.id} className="comment">
                                <div className="comment-body">Comment: {commentData}</div>
                                <div className="comment-footer">
                                    <span>Date Posted: {commentDate}</span>
                                    <span>Time Posted: {commentTime}</span>
                                </div>
                                </li>
                            </ul>
                            ) : null;
                        });
        
                        if(UrgentPost.id){
                            const userId = UrgentPost.user_id
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

                            
                            // Get distance from Urgent Post
                            async function getDistanceFrom(evt){
                                evt.preventDefault();
                                const urgentPostId = UrgentPost.id
                
                                try{
                                    let response = await axios.post(`http://localhost:5000/feed/${userId}/urgentPost`, {
                                        token,
                                        urgentPostId
                                })
                
                                console.log("This is the response from the distance", response.data)
                                alert(response.data)
                                } catch (error){
                                    alert("Can not locate approximate distnace between")
                                    console.log("There is an error fetching the distance", error)
                                }
                
                            }

                            // click button that is going to make a axios request that pulls up the post and navigates to a page that displays the post
                            async function handleCommentUrgentPost(event){
                                event.preventDefault()
                                const urgentPostId = UrgentPost.id

                                let response = await axios.post(`http://localhost:5000/urgentPosts/${userId}/specificUrgentPost`, {
                                    token,
                                    urgentPostId
                                })
                                const urgentPostData = response.data

                                navigate("/users/feed/commentUrgentPost", {state: urgentPostData})
                            }
        
                            return (
                                    <div key={UrgentPost.id} className="post">

                                        <section className="post-section">   
                                            <section>
                                                <h2>Urgent Posts</h2>
                                                <h3>{UrgentPost.post}</h3>
                                                <button onClick={handleCommentUrgentPost}> Comment </button>
                                                <p> Location: {UrgentPost.userlocation} </p>
                                                <button onClick={getDistanceFrom}> See Distance From </button>
                                            </section>

                                            <section>
                                                <p>Date Posted: {UrgentPost.dateposted}</p>
                                                <p>Time Posted: {UrgentPost.timeposted}</p>
                                            </section>

                                            <section>
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
        
                        }
        
            });
            setUrgentPosts(mappedUrgentPosts)
    
        }else(
            console.log("Nevermind")
        )
    
        
    }, [])

     // click button that is going to make a axios request that pulls up the post and navigates to a page that displays the post
     async function handleFollowUser(event){
        event.preventDefault()

        try{

            let response = await axios.post(`http://localhost:5000/follow/${userId}/addUser`, {
                token,
                otherId
            })
            response = response.data
            console.log(response)
    
            alert(`User ${username} has been Followed`)
            navigate("/users/feed")

        }catch(error){
            alert("User already Followed")
            console.log(error)
        }

    }

    // Function to allow a user to go back to their feed
    async function visitUserFeed(evt){
        evt.preventDefault();

        navigate("/users/feed")
    }


     return (
        <div className={styles.feedPage}>
        {/* Navigation Section */}
        <section className={styles.navSection}>
            <nav>
            <h1>Kingdom Communit-E</h1>
            <div className={styles.navLinks}>
                <Link to="/">Logout</Link>
                <Link to="/users">Homepage</Link>
            </div>
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
                        <p> {otherBio} </p>
                        <p> {distance} </p>
                    </section>

                    <section className="follow-section">
                        <button onClick={handleFollowUser}> Follow </button>
                        <button onClick={visitUserFeed}> Visit Feed </button>
                    </section>

                </div>
        </section>

        {/* User Posts Section */}
        <section className={styles.userPostsSection}>
            <section>
            <div className={styles.postsContainer}>
                <h2 className={styles.postsHeader}>{username}'s Posts</h2>
                {posts}
            </div>
            </section>
            <section>
            <div className={styles.postsContainer}>
                <h2 className={styles.postsHeader}>{username}'s Events</h2>
                {events}
            </div>
            </section>
            <section>
            <div className={styles.postsContainer}>
                <h2 className={styles.postsHeader}>{username}'s Urgent Posts</h2>
                {urgentPosts}
            </div>
            </section>
        </section>
        </div>
    );
}

export default VisitingUsersHomepage