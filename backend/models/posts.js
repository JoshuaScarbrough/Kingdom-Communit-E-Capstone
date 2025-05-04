const db = require('../db.js');
const User = require("./user.js");
const Event = require("./events.js");
const UrgentPost = require("./urgentPosts.js");
const LatLon = require("./latLon.js")

class Post {

    // Function to get a post from the Posts table
    static async getPost(post_id){
        let selectedPost = await db.query(
            `SELECT * FROM posts WHERE id = $1`,
            [post_id]
        )
        selectedPost = selectedPost.rows[0]
        return selectedPost
    }

    // Function to like a post from the Posts table
    static async likePost(user_id, post_id){

        // Selects user
        let user = await db.query(`SELECT * FROM users WHERE id = $1`, [user_id])
        user = user.rows[0]

        // Selects the post
        const post = await Post.getPost(post_id);

        // Selects post numLikes
        let postLikes = post.numlikes

        // Likes the post
        const like = await db.query(
            `INSERT iNTO postsLiked (user_id, post_id)
            VALUES ($1, $2) `,
            [user.id, post.id]
        )

        if(like){

            postLikes = postLikes + 1;
 
            const updateLikes = await db.query(
                `UPDATE posts SET numlikes = $1 WHERE id = $2`,
                [postLikes, post.id]
            )
            updateLikes;

            return ({message: `${user.username}, has liked a post`, post: post})
        }


    } 

    // Function to unlike a post from the Posts table
    static async unlikePost(user_id, post_id){

        // Selects user
        let user = await db.query(`SELECT * FROM users WHERE id = $1`, [user_id])
        user = user.rows[0]

        // Selects the post
        const post = await Post.getPost(post_id);

        // Selects post numLikes
        let postLikes = post.numlikes

        // Deletes from the postLiked table which removes the like
        let unlike = await db.query(
            `DELETE FROM postsLiked WHERE user_id = $1 AND post_id = $2`,
            [user.id, post.id]
        )
        unlike;

        if(unlike){
            postLikes = postLikes - 1;

            const updateLikes = await db.query(
                `UPDATE posts SET numlikes = $1 WHERE id = $2`,
                [postLikes, post.id]
            )
            updateLikes;

            return({message: "Post Unliked"})

        }

    }

        // Function to comment on a post in the Posts table
        static async addComment(user_id, post_id, comment){

            // Selects user
            let user = await db.query(`SELECT * FROM users WHERE id = $1`, [user_id])
            user = user.rows[0]
    
            // Selects the post
            const post = await Post.getPost(post_id);
    
            // Selects post numLikes
            let numComments = post.numcomments
    
            // Creates a comment
            let insertComment = await db.query(
                `INSERT INTO comments(user_id, post_id, comment)
                VALUES($1, $2, $3)
                RETURNING comment`,
                [user.id, post.id, comment]
    
            )
            insertComment = insertComment.rows[0]
            console.log(insertComment)
    
            // If there is a comment it updates the number of comments on the post table
            if(insertComment){
                numComments = numComments + 1;
    
                const updateNumComments = await db.query(
                    `UPDATE posts SET numcomments = $1 WHERE id = $2 RETURNING numcomments`, 
                    [numComments, post.id]
                )
    
                return({message: "Post has been commented on"})
    
            }
        }

    // Function to see all the comments for a given post in the Posts table
    static async getComments(post_id){

        // Selects the post
        const post = await Post.getPost(post_id);

        // Views post comments
        const comments = await db.query(
            `SELECT user_id, comment, dateposted, timeposted, numcomments  
            FROM comments 
            WHERE post_id = $1`,
            [post_id]
        )

        const allComments = comments.rows

        return ({comments: allComments})
    }

     // Function to get a specific post from the user and its comments from the Posts table
     static async getFullPost(post_id){

        const post = await Post.getPost(post_id)

        const comments = await Post.getComments(post_id)
        const allComments = comments.comments

        if(post){
            const eventAndComments = {
                post: post,
                comments: allComments
            }

            return (eventAndComments)
        }
    }


    // Get all post and their comments from the posts table 
    static async getAllFullPosts(user_id){

        let user = await db.query(
            `SELECT * FROM users WHERE id = $1`,
            [user_id]
        )
        user = user.rows[0]

        let allPosts = await db.query(
            `SELECT id FROM posts WHERE user_id = $1`,
            [user_id]
        )
        allPosts = allPosts.rows

        const ids = allPosts.map(post => post.id)

        const fullPost = await Promise.all(ids.map(async (id) => await Post.getFullPost(id)))

        return fullPost
    }

    // Need to be able to get all posts and comments from every user
    static async getAllFeedPosts(){

        // Loop through all the Posts and pull out their ids
        let allPostIds = await db.query(
            `SELECT id FROM posts`
        )
        allPostIds = allPostIds.rows

        // Loop through all the Posts and pull out their ids
        let allEventIds = await db.query(
            `SELECT id FROM events`
        )
        allEventIds = allEventIds.rows

        // Loop through all the Posts and pull out their ids
        let allUrgentPostIds = await db.query(
            `SELECT id FROM posts`
        )
        allUrgentPostIds = allUrgentPostIds.rows

        // Array of all ids for their respetive post type
        const post_ids = allPostIds.map(post => post.id)
        const event_ids = allEventIds.map(event => event.id)
        const urgentPost_ids = allUrgentPostIds.map(urgentPost => urgentPost.id)

        // Getting back the entire Post of all the respective post types 
        const fullPost = await Promise.all(post_ids.map(async (id) => await Post.getFullPost(id)))
        const fullEvent = await Promise.all(event_ids.map(async (id) => await Event.getFullEvent(id)))
        const fullUrgentPost = await Promise.all(urgentPost_ids.map(async (id) => await UrgentPost.getFullUrgentPost(id)))

        
        const feed = {
            fullPost: fullPost,
            fullEvent: fullEvent,
            fullUrgentPost: fullUrgentPost
        }
        return feed


    }

    static async getAllFollowingFeedPosts(user_id){

        // Gets user from the database 
        let user = await db.query(
            `SELECT * FROM users WHERE id = $1`,
            [user_id]
        )
        user = user.rows[0]

        // Query string to select all the users a user is following
        const results = await db.query(
            `SELECT users.id 
            FROM users 
            JOIN followers ON users.id = followers.following_id
            WHERE followers.follower_id = $1`,
            [user.id]
        )

        const following = results.rows

        const user_ids = following.map(user => user.id)

        const fullPost = await Promise.all(user_ids.map(async (id) => await Post.getAllFullPosts(id)))
        const fullEvent = await Promise.all(user_ids.map(async (id) => await Event.getAllFullEvents(id)))
        const fullUrgentPost = await Promise.all(user_ids.map(async (id) => await UrgentPost.getAllFullUrgentPosts(id)))

        const followingPosts = {
            following_posts: fullPost,
            following_events: fullEvent,
            following_urgent_posts: fullUrgentPost
        }
        return followingPosts


    }



    /**
     * Functionality to check all the events and their addresses at once
     */

    // let userCoordinates = await LatLon.userCoordinates(user_id)
        // console.log(userCoordinates)

        // let events_id = await db.query(
        //     `SELECT id FROM events`
        // )
        // events_id = events_id.rows
        
        // const test = events_id.map(event => event.id)
        // console.log(test)

        // const allDistance = await Promise.all(test.map(async (id) => await LatLon.getEventDistance(user_id, id)))
        // console.log(allDistance)


}

module.exports = Post