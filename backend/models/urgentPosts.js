const db = require('../db.js');
const User = require("../models/user");

class UrgentPost {

// Function to get an Urgent Posts post
static async getUrgentPost(post_id){
    let selectedPost = await db.query(
        `SELECT * FROM urgentPosts WHERE id = $1`,
        [post_id]
    )
    selectedPost = selectedPost.rows[0]

    let res 

    if(selectedPost !== undefined ){

        res = selectedPost
        return res
    }
    else{
        console.log( "Error" )
    }

}

static async setNumComments(post_id){

    // Selects the post 
    let postData = await db.query(`SELECT * FROM urgentPosts WHERE id=$1`, [post_id]);
    postData = postData.rows

    const post = postData[0]

    let postNumComments = post.numcomments


    // Checks to see if their are comments in the database already for the comment
    let commentCheck = await db.query(
        `SELECT * FROM comments WHERE urgentPost_id = $1`, 
        [post_id]
    )
    commentCheck = commentCheck.rows

    if(postNumComments !== commentCheck.length){

        for(let i=0; i< commentCheck.length; i++){
            postNumComments ++

        }

        const setNumComments = await db.query(
            `Update urgentPosts 
            SET numComments = $1
            WHERE id = $2
            RETURNING numComments`,
            [postNumComments, post_id]

        )

        return(postNumComments)
    }

    
}

// Function to comment on a post in the UrgentPosts table
static async addComment(user_id, post_id, comment){

    // Selects post numComments
    let numComments = await UrgentPost.setNumComments(post_id)

    // Creates a comment
    let insertComment = await db.query(
        `INSERT INTO comments(user_id, post_id, comment)
        VALUES($1, $2, $3) `,
        [user_id, post_id, comment]

    )

    // If there is a comment it updates the number of comments on the post table
    if(insertComment){
        numComments = numComments + 1;

        const updateNumComments = await db.query(
            `UPDATE urgentPosts SET numcomments = $1 WHERE id = $2`, 
            [numComments, post_id]
        )
        updateNumComments;

        return({message: "Commented on post"})

    }
}

// Function to see all the comments for a given event in the Events table
static async getComments(post_id){

    // Views post comments
    const comments = await db.query(
        `SELECT user_id, comment, dateposted, timeposted 
        FROM comments 
        WHERE urgentPost_id = $1`,
        [post_id]
    )

    const allComments = comments.rows

    return ({comments: allComments})
}

 // Function to get a specific Urgent Post from the user and its comments from the Urgent Posts table
 static async getFullUrgentPost(urgentPostId){

    const post = await UrgentPost.getUrgentPost(urgentPostId)

    // Selects post numComments
    let numComments = await UrgentPost.setNumComments(urgentPostId)

    const comments = await UrgentPost.getComments(urgentPostId)
    const allComments = comments.comments

    if(post){
        const postAndComments = {
            UrgentPost: post,
            comments: allComments
        }

        return (postAndComments)
    }
}

  // Get all post and their comments from the Urgent Posts table 
  static async getAllFullUrgentPosts(user_id){

    let user = await db.query(
        `SELECT * FROM users WHERE id = $1`,
        [user_id]
    )
    user = user.rows[0]

    let allPosts = await db.query(
        `SELECT id FROM urgentPosts WHERE user_id = $1`,
        [user_id]
    )
    allPosts = allPosts.rows

    const ids = allPosts.map(post => post.id)

    const fullUrgentPost = await Promise.all(ids.map(async (id) => await UrgentPost.getFullUrgentPost(id)))

    return fullUrgentPost
}


}

module.exports = UrgentPost