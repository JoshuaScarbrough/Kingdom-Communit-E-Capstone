import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";


function UserFeed(){
    const navigate = useNavigate();
    
        // The different pieces of (User)state that are used to handle the different peices of data that are on the page.
        const [username, setUsername] = useState(null);
        const [profilePic, setProfilePic] = useState(null);

        // The different pieces of (Post)state that are used to handle the different peices of data that are on the page. These are going to be a part of the feed (feed) posts
        const [posts, setPosts] = useState(null);
        const [events, setEvents] = useState(null);
        const [urgentPosts, setUrgentPosts] = useState(null);

        // The different pieces of (Post)state that are used to handle the different peices of data that are on the page. These are going to be a part of the feed (followingFeed) posts
        const [followingPost, setFollowingPost] = useState(null);
        const [followingEvent, setFollowingEvent] = useState(null);
        const [followingUrgentPost, setFollowingUrgentPost] = useState(null);

        // The token is grabbed out of the sessionStorage, then decoded and the userId is grabbed out to put into the parameter string for the api request
        const token = sessionStorage.getItem("token");
        const decoded = token ? jwtDecode(token) : null;
        const userId = decoded ? decoded.id : null;

        useEffect(() => {

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
                                <h1> {getPostUser()} Post </h1>
                                <h3>{post.post}</h3>
                                <button onClick={handleLikePost}> Like </button>
                                <button onClick={handleCommentPost}> Comment </button>
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
                            <div key={event.id} className="event">
                                <h1> {getEventUser()} Event </h1>
                                <h3>{event.post}</h3>
                                <button onClick={handleLikeEvent}> Like </button>
                                <button onClick={handleCommentEvent}> Comment </button>
                                <p> Location: {event.userlocation} </p>
                                <p> Date Posted: {event.dateposted} </p>
                                <p> Time Posted: {event.timeposted} </p>
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

                    }
                    });

                    setEvents(mappedEvents)
                }else{
                    console.log("Nevermind")
                }



                if(feedUrgentPosts){
                    console.log(feedUrgentPosts)

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

                    if(UrgentPost.id){
                        const userId = UrgentPost.user_id
                        console.log("Im getting", UrgentPost.numcomments)

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
                            <div key={UrgentPost.id} className="urgent">
                                <h1> {getUrgentPostUser()} Urgent Post </h1>
                                <h3>{UrgentPost.post}</h3>
                                <button onClick={handleCommentUrgentPost}> Comment </button>
                                <p> Location: {UrgentPost.userlocation} </p>
                                <p> Date Posted: {UrgentPost.dateposted} </p>
                                <p> Time Posted: {UrgentPost.timeposted} </p>
                                <p> Number of Comments: {UrgentPost.numcomments} </p>
                                <h4>Comments:</h4>
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



                        return (
                            <div key={post.id} className="followingPost">
                                <h3> {getPostUser()} Post </h3>
                                <h5>{post.post}</h5>
                                <button onClick={handleLikePost}> Like </button>
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


                        return (
                            <div key={event.id} className="followingEvent">
                                <h3> {getEventUser()} Event </h3>
                                <h5>{event.post}</h5>
                                <button onClick={handleLikeEvent}> Like </button>
                                <p> Location: {event.userlocation} </p>
                                <p> Date Posted: {event.dateposted} </p>
                                <p> Time Posted: {event.timeposted} </p>
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



                        return (
                            <div key={UrgentPost.id} className="followingEvent">
                                <h3> {getUrgentPostUser()} Urgent Post </h3>
                                <h5>{UrgentPost.post}</h5>
                                <p> Location: {UrgentPost.userlocation} </p>
                                <p> Date Posted: {UrgentPost.dateposted} </p>
                                <p> Time Posted: {UrgentPost.timeposted} </p>
                                <p> Number of Comments: {UrgentPost.numcomments} </p>
                                <h4>Comments:</h4>
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
        


    return(
        <div>

            <section>
                <h1> Kingdom Communit-E </h1>
            </section>

            <section>
                <a href="/users"> <h3> {username} </h3> </a>
                <img src={profilePic} width="200" height="200"></img>
            </section>

            <section>
                {posts}
            </section>

            <section>
                {events}
            </section>

            <section>
                {urgentPosts}
            </section>
            
            <section>
                <h1> {username}'s Following Posts </h1>
                {followingPost}
            </section>

            <section>
                <h1> {username}'s Following Events </h1>
                {followingEvent}
            </section>

            <section>
                <h1> {username}'s Following Urgent Posts </h1>
                {followingUrgentPost}
            </section>
            
        </div>
    )
}

export default UserFeed