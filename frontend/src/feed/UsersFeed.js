import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import "./UsersFeed.module.css";  // Import the module CSS

function UserFeed(){
    const navigate = useNavigate();
    
        // The different pieces of (User)state that are used to handle the different peices of data that are on the page.
        const [username, setUsername] = useState(null);
        const [profilePic, setProfilePic] = useState(null);;

        // The different pieces of (Post)state that are used to handle the different peices of data that are on the page. These are going to be a part of the feed (feed) posts
        const [posts, setPosts] = useState(null);
        const [events, setEvents] = useState(null);
        const [urgentPosts, setUrgentPosts] = useState(null);

        // The different pieces of (Post)state that are used to handle the different peices of data that are on the page. These are going to be a part of the feed (followingFeed) posts
        const [followingPost, setFollowingPost] = useState(null);
        const [followingEvent, setFollowingEvent] = useState(null);
        const [followingUrgentPost, setFollowingUrgentPost] = useState(null);

        // State to toggle the display of the user posts section (posts, events, urgent posts) and the following posts
        const [showUserPosts, setShowUserPosts] = useState(false);
        const [showFollowingPosts, setShowFollowingPosts] = useState(false);

        // The token is grabbed out of the sessionStorage, then decoded and the userId is grabbed out to put into the parameter string for the api request
        const token = sessionStorage.getItem("token");
        const decoded = token ? jwtDecode(token) : null;
        const userId = decoded ? decoded.id : null;

        useEffect(() => {

            // Makes sure that if there is no token you are re-routed back to the homepage
            if(token == null){
                alert("Please Login")
                navigate("/")
                return; // Stops further execution
            }

            const fetchFeed = async () => {

                // Gets the user from the database
                let user = await axios.post(`http://localhost:5000/users/${userId}`, {
                    token
                })
                user = user.data.user

                const username = user.username
                const profilePicture = user.profilepictureurl
                setUsername(username)
                setProfilePic(profilePicture)


                // This gets all the user feed data from the database
                let response = await axios.post(`http://localhost:5000/feed/${userId}`, {
                    token
                });
                response = response.data
                
                // Gets all the feed responses from the axios call 
                const feed = response.feed
                const feedPost = feed.fullPost
                const feedEvents = feed.fullEvent
                const feedUrgentPosts = feed.fullUrgentPost
                // These need to be flattened due to the way they are arranged
                const flatUrgentPosts = feedUrgentPosts.flat()

                // Gets all the followingFeed resposes from the axios call
                const followingFeed = response.followingFeed
                let followingFeedPosts = followingFeed.following_posts
                followingFeedPosts = followingFeedPosts.flat()
                let followingFeedEvents = followingFeed.following_events
                followingFeedEvents = followingFeedEvents.flat()
                let followingFeedUrgentPosts = followingFeed.following_urgent_posts
                followingFeedUrgentPosts = followingFeedUrgentPosts.flat()

            
                if(feedPost){

                    const mappedPosts = feedPost.map((postItem) => {
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
                    let getCommentedUser = async () => {
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

                
     
                            async function visitUserHomepage(evt){
                                evt.preventDefault();
                                const otherId = commentUserId

                                let response = await axios.post(`http://localhost:5000/follow/${userId}/view/${otherId}`, {
                                        token,
                                        otherId
                                })
                                response = response.data

                                navigate("/users/VisitUser", {state: response})
                            }
                            
        

                            // Only render if commentData exists.
                            return commentData ? (
                                <ul className="comments-container">
                                    <li key={commentItem.id} className="comment">
                                    <div className="comment-body">Comment: {commentData}</div>
                                    <button onClick={visitUserHomepage}>Visit User Homepage</button>
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

                        async function visitUserHomepage(evt){
                            evt.preventDefault();
                            const otherId = post.user_id

                            let response = await axios.post(`http://localhost:5000/follow/${userId}/view/${otherId}`, {
                                token,
                                otherId
                            })
                            response = response.data

                            navigate("/users/VisitUser", {state: response})
                        }
                    
                        return (
                            <div key={post.id} className="post">

                                <section className="post-section">   
                                    <section>
                                        <h2> Post</h2>
                                        <button onClick={visitUserHomepage}> Visit User </button>
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
                }else{
                    console.log("Nevermind")
                }


                if(feedEvents){

                    const mappedEvents = feedEvents.map((postItem) => {
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

                         
                            async function visitUserHomepage(evt){
                                evt.preventDefault();
                                const otherId = commentUserId

                                let response = await axios.post(`http://localhost:5000/follow/${userId}/view/${otherId}`, {
                                        token,
                                        otherId
                                })
                                response = response.data

                                navigate("/users/VisitUser", {state: response})
                            }
                            
        

                            // Only render if commentData exists.
                            return commentData ? (
                                <ul className="comments-container">
                                    <li key={commentItem.id} className="comment">
                                    <div className="comment-body">Comment: {commentData}</div>
                                    <button onClick={visitUserHomepage}>Visit User Homepage</button>
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

                        async function visitUserHomepage(evt){
                            evt.preventDefault();
                            const otherId = event.user_id

                            let response = await axios.post(`http://localhost:5000/follow/${userId}/view/${otherId}`, {
                                token,
                                otherId
                            })
                            response = response.data

                            navigate("/users/VisitUser", {state: response})
                        }

                        return (
                            <div key={event.id} className="post">

                                <section className="post-section">   
                                    <section>
                                        <h2> Event</h2>
                                        <h3>{event.post}</h3>
                                        <button onClick={visitUserHomepage}> Visit User </button>
                                        <h4> {event.userlocation} </h4>
                                        <button onClick={getDistanceFrom}> See Distance From </button>
                                        <button onClick={handleLikeEvent}> Like </button>
                                        <button onClick={handleCommentEvent}> Comment </button>
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
                }else{
                    console.log("Nevermind")
                }



                if(feedUrgentPosts){

                    const mappedUrgentPosts = flatUrgentPosts.map((postItem) => {
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

                         
                            async function visitUserHomepage(evt){
                                evt.preventDefault();
                                const otherId = commentUserId

                                let response = await axios.post(`http://localhost:5000/follow/${userId}/view/${otherId}`, {
                                        token,
                                        otherId
                                })
                                response = response.data

                                navigate("/users/VisitUser", {state: response})
                            }
                            
        

                            // Only render if commentData exists.
                            return commentData ? (
                                <ul className="comments-container">
                                    <li key={commentItem.id} className="comment">
                                    <div className="comment-body">Comment: {commentData}</div>
                                    <button onClick={visitUserHomepage}>Visit User Homepage</button>
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
                        const getUrgentPostUser = async () => {
                        let urgentPostUser = await axios.post(`http://localhost:5000/users`, {
                            id: userId
                        })
                        
                        urgentPostUser = urgentPostUser.data

                        let username = urgentPostUser[0]
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

                        async function visitUserHomepage(evt){
                            evt.preventDefault();
                            const otherId = UrgentPost.user_id

                            let response = await axios.post(`http://localhost:5000/follow/${userId}/view/${otherId}`, {
                                token,
                                otherId
                            })
                            response = response.data

                            navigate("/users/VisitUser", {state: response})
                        }
                    


                         return (
                            <div key={UrgentPost.id} className="post">

                                <section className="post-section">   
                                    <section>
                                        <h2> Urgent Post </h2>
                                        <h3>{UrgentPost.post}</h3>
                                        <button onClick={visitUserHomepage}> Visit User </button>
                                        <h4> {UrgentPost.userlocation} </h4>
                                        <button onClick={getDistanceFrom}> See Distance From </button>
                                        <button onClick={handleCommentUrgentPost}> Comment </button>
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

                    }
                    });

                    setUrgentPosts(mappedUrgentPosts)
                    }else{
                        console.log("Nevermind")
                    }


                if(followingFeedPosts){

                    const mappedFollowingPost = followingFeedPosts.map((postItem) => {
                    const { post , comments } = postItem; 

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
     
                            async function visitUserHomepage(evt){
                                evt.preventDefault();
                                const otherId = commentUserId

                                let response = await axios.post(`http://localhost:5000/follow/${userId}/view/${otherId}`, {
                                        token,
                                        otherId
                                })
                                response = response.data

                                navigate("/users/VisitUser", {state: response})
                            }
                            
        

                            // Only render if commentData exists.
                            return commentData ? (
                                <ul className="comments-container">
                                    <li key={commentItem.id} className="comment">
                                    <div className="comment-body">Comment: {commentData}</div>
                                    <button onClick={visitUserHomepage}>Visit User Homepage</button>
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

                        async function visitUserHomepage(evt){
                            evt.preventDefault();
                            const otherId = post.user_id

                            let response = await axios.post(`http://localhost:5000/follow/${userId}/view/${otherId}`, {
                                token,
                                otherId
                            })
                            response = response.data

                            navigate("/users/VisitUser", {state: response})
                        }


                        return (
                            <div key={post.id} className="post">

                                <section className="post-section">   
                                    <section>
                                        <h2> Post</h2>
                                        <h3>{post.post}</h3>
                                        <button onClick={visitUserHomepage}> Visit User </button>
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

                    setFollowingPost(mappedFollowingPost)
                }else{
                    console.log("Nevermind")
                }


                if(followingFeedEvents){

                    const mappedFollowingEvent = followingFeedEvents.map((postItem) => {
                    const { event , comments } = postItem; 

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

                       
                            async function visitUserHomepage(evt){
                                evt.preventDefault();
                                const otherId = commentUserId

                                let response = await axios.post(`http://localhost:5000/follow/${userId}/view/${otherId}`, {
                                        token,
                                        otherId
                                })
                                response = response.data

                                navigate("/users/VisitUser", {state: response})
                            }
                            
        

                            // Only render if commentData exists.
                            return commentData ? (
                                <ul className="comments-container">
                                    <li key={commentItem.id} className="comment">
                                    <div className="comment-body">Comment: {commentData}</div>
                                    <button onClick={visitUserHomepage}>Visit User Homepage</button>
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
                        
                        async function visitUserHomepage(evt){
                            evt.preventDefault();
                            const otherId = event.user_id

                            let response = await axios.post(`http://localhost:5000/follow/${userId}/view/${otherId}`, {
                                token,
                                otherId
                            })
                            response = response.data

                            navigate("/users/VisitUser", {state: response})
                        }

                        return (
                            <div key={event.id} className="post">

                                <section className="post-section">   
                                    <section>
                                        <h2> Event</h2>
                                        <h3>{event.post}</h3>
                                        <button onClick={visitUserHomepage}> Visit User </button>
                                        <h4> {event.userlocation} </h4>
                                        <button onClick={getDistanceFrom}> See Distance From </button>
                                        <button onClick={handleLikeEvent}> Like </button>
                                        <button onClick={handleCommentEvent}> Comment </button>
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

                    setFollowingEvent(mappedFollowingEvent)
                }else{
                    console.log("Nevermind")
                }


                if(followingFeedUrgentPosts){

                    const mappedFollowingUrgentPosts = followingFeedUrgentPosts.map((postItem) => {
                    const { UrgentPost , comments } = postItem; 

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

                        
                            async function visitUserHomepage(evt){
                                evt.preventDefault();
                                const otherId = commentUserId

                                let response = await axios.post(`http://localhost:5000/follow/${userId}/view/${otherId}`, {
                                        token,
                                        otherId
                                })
                                response = response.data

                                navigate("/users/VisitUser", {state: response})
                            }
                            
        

                            // Only render if commentData exists.
                            return commentData ? (
                                <ul className="comments-container">
                                    <li key={commentItem.id} className="comment">
                                    <div className="comment-body">Comment: {commentData}</div>
                                    <button onClick={visitUserHomepage}>Visit User Homepage</button>
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
                        const getUrgentPostUser = async () => {
                        let urgentPostUser = await axios.post(`http://localhost:5000/users`, {
                            id: userId
                        })
                        
                        urgentPostUser = urgentPostUser.data

                        let username = urgentPostUser[0]
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

                        async function visitUserHomepage(evt){
                            evt.preventDefault();
                            const otherId = UrgentPost.user_id

                            let response = await axios.post(`http://localhost:5000/follow/${userId}/view/${otherId}`, {
                                token,
                                otherId
                            })
                            response = response.data

                            navigate("/users/VisitUser", {state: response})
                        }

                        return (
                            <div key={UrgentPost.id} className="post">

                                <section className="post-section">   
                                    <section>
                                        <h2> Urgent Post </h2>
                                        <h3>{UrgentPost.post}</h3>
                                        <button onClick={visitUserHomepage}> Visit User </button>
                                        <h4> {UrgentPost.userlocation} </h4>
                                        <button onClick={getDistanceFrom}> See Distance From </button>
                                        <button onClick={handleCommentUrgentPost}> Comment </button>
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

                    }
                    });

                    setFollowingUrgentPost(mappedFollowingUrgentPosts)
                }else{
                    console.log("Nevermind")
                }




            }

            fetchFeed();

        }, [])

  return (
    <div>
      {/* Navigation Section */}
      <section className="nav-section">
        <nav>
          <h1>Kingdom Communit-E</h1>
          <Link to="/">Logout</Link>
          <Link to="/users">Homepage</Link>
        </nav>
      </section>

      <div className="user-feed-layout">
        {/* Sidebar (User Info Section) */}
        <aside className="sidebar">
          <section className="user-info-section">
            <a href="/users">
              <h2>{username}</h2>
            </a>
            <img src={profilePic} alt="Profile" width="200" height="200" />
          </section>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          {/* User Posts Section */}
          <section className="user-posts-section">
            <header className="posts-section-header">
              Communit-E Feed
            </header>
            <button
              className="toggle-posts-btn"
              onClick={() => setShowUserPosts(!showUserPosts)}
            >
              {showUserPosts ? "Hide All Posts" : "Show All Posts"}
            </button>
            {showUserPosts && (
              <>
                <section>
                  <div className="posts-container">
                    <h2 className="posts-header"> Communit-E Posts</h2>
                    {posts}
                  </div>
                </section>
                <section>
                  <div className="posts-container">
                    <h2 className="posts-header"> Upcoming Events</h2>
                    {events}
                  </div>
                </section>
                <section>
                  <div className="posts-container">
                    <h2 className="posts-header"> Hurry someone needs help!! </h2>
                    {urgentPosts}
                  </div>
                </section>
              </>
            )}
          </section>

          {/* User Following Section */}
          <section className="user-following-section">
            <header className="posts-section-header">
              {username}'s Following Content
            </header>
            <button
              className="toggle-posts-btn"
              onClick={() => setShowFollowingPosts(!showFollowingPosts)}
            >
              {showFollowingPosts ? "Hide Following Posts" : "Show Following Posts"}
            </button>
            {showFollowingPosts && (
              <>
                <section>
                  <div className="posts-container">
                    <h2 className="posts-header">{username}'s Following Posts</h2>
                    {followingPost}
                  </div>
                </section>
                <section>
                  <div className="posts-container">
                    <h2 className="posts-header">{username}'s Following Events</h2>
                    {followingEvent}
                  </div>
                </section>
                <section>
                  <div className="posts-container">
                    <h2 className="posts-header">{username}'s Following Urgent Posts</h2>
                    {followingUrgentPost}
                  </div>
                </section>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default UserFeed