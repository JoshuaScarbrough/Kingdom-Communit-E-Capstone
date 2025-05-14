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

    static async setNumComments(post_id){

        // Selects the post 
        const post = await Post.getPost(post_id);

        let postNumComments = post.numcomments

        // Checks to see if their are comments in the database already for the comment
        let commentCheck = await db.query(
            `SELECT * FROM comments WHERE post_id = $1`, 
            [post_id]
        )
        commentCheck = commentCheck.rows

        if(postNumComments !== commentCheck.length){

            for(let i=0; i< commentCheck.length; i++){
                postNumComments ++
            }
    
            const setNumComments = await db.query(
                `Update posts 
                SET numComments = $1
                WHERE id = $2
                RETURNING numComments`,
                [postNumComments, post_id]
    
            )
        }

        return(postNumComments)
        
    }

    static async setNumLikes(post_id){

        // Selects the post 
        const post = await Post.getPost(post_id);

        let postNumLikes = post.numlikes

        // Checks to see if their are comments in the database already for the comment
        let likesCheck = await db.query(
            `SELECT * FROM postsLiked WHERE post_id = $1`, 
            [post_id]
        )
        likesCheck = likesCheck.rows

        if(postNumLikes !== likesCheck.length){

            for(let i=0; i< likesCheck.length; i++){
                postNumLikes ++
            }
    
            const setNumLikes = await db.query(
                `Update posts 
                SET numLikes = $1
                WHERE id = $2
                RETURNING numComments`,
                [postNumLikes, post_id]
    
            )
        }

        return(postNumLikes)
    }

    // Function to like a post from the Posts table
    static async likePost(user_id, post_id){

        // Selects user
        let user = await db.query(`SELECT * FROM users WHERE id = $1`, [user_id])
        user = user.rows[0]

        // Selects the post
        const post = await Post.getPost(post_id);

        // Selects post numLikes
        let numLikes = await Post.setNumLikes(post_id)

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

            // Sets post numComments
            let numComments = await Post.setNumComments(post_id)
    
            // Creates a comment
            let insertComment = await db.query(
                `INSERT INTO comments(user_id, post_id, comment)
                VALUES($1, $2, $3)
                RETURNING comment`,
                [user.id, post.id, comment]
    
            )
            insertComment = insertComment.rows[0]
    
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

        const numComments = await Post.setNumComments(post_id)

        // Views post comments
        const comments = await db.query(
            `SELECT id, user_id, comment, dateposted, timeposted  
            FROM comments 
            WHERE post_id = $1`,
            [post_id]
        )

        const allComments = comments.rows
        console.log(allComments)

        return ({comments: allComments})
    }

     // Function to get a specific post from the user and its comments from the Posts table
     static async getFullPost(post_id){

        const post = await Post.getPost(post_id)

        // Sets the NumLikes and NumComments
        const numComments = await Post.setNumComments(post_id)
        let numLikes = await Post.setNumLikes(post_id)

        const comments = await Post.getComments(post_id)
        const allComments = comments.comments
        console.log(`All comments ${allComments}`)

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
        const fullUrgentPost = await Promise.all(urgentPost_ids.map(async (id) => await UrgentPost.getAllFullUrgentPosts(id)))

        
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

}

module.exports = Post