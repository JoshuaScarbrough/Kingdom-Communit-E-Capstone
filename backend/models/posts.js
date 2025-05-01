const db = require('../db.js');
const User = require("../models/user");

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
        const user = await User.get(user_id)

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
            console.log(postLikes)
 
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
        const user = await User.get(user_id)

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
            const user = await User.get(user_id)
    
            // Selects the post
            const post = await Post.getPost(post_id);
    
            // Selects post numLikes
            let numComments = post.numComments
    
            // Creates a comment
            let insertComment = await db.query(
                `INSERT INTO comments(user_id, post_id, comment)
                VALUES($1, $2, $3) `,
                [user.id, post.id, comment]
    
            )
            insertComment;
    
            // If there is a comment it updates the number of comments on the post table
            if(insertComment){
                numComments = numComments + 1;
    
                const updateNumComments = await db.query(
                    `UPDATE posts SET numcomments = $1 WHERE id = $2`, 
                    [numComments, post.id]
                )
                updateNumComments;
    
                return({message: "Commented on post"})
    
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

        const event = await Post.getPost(post_id)

        const comments = await Post.getComments(post_id)
        const allComments = comments.comments

        if(event){
            const eventAndComments = {
                event: event,
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
}

module.exports = Post