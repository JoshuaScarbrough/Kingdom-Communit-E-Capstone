const express = require('express');
const router = express.Router();
const db = require('../db')
const jwt = require("jsonwebtoken");

const { createToken } = require("../helpers/tokens")
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const Post = require("../models/posts");
const Event = require("../models/events");

/**
 * Everything for a post
 */

router.get('/', async function (req, res, next){
    res.send("Post routes are working");
})


// See all the post and comments by a user *Working*
router.get('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            const post = await Post.getAllFullPosts(data.id)
    
            return res.send(post)
        }

    }catch(e){
        next (e)
    }
})

// Route to see a specific post and its comments 
router.get('/:id/specificPost', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        const {post_id} = req.body;

        if(data){


            const fullPost = await Post.getFullPost(post_id)
    
            return res.send(fullPost)
        }

    }catch(e){
        next (e)
    }
})

// Create a post
router.post('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            const {post, imageUrl} = req.body
            const newPost = await User.createPost(data.username, post, imageUrl)

            const extractPost = newPost.row.replace(/[()]/g, "").split(',');
                
                let currentPost = await db.query(
                    `SELECT post, imageURL FROM posts WHERE id = $1`,
                    [extractPost[0]]
                )
                
                currentPost = currentPost.rows[0]
                res.status(201).json({message: 'Post created successfully', currentPost});
           
        }


    }catch (e){
        next (e);
    }
})

// Delete a post 
router.delete('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            const {post_id} = req.body;

            // Checks if post exsist
            const posts = await db.query(`SELECT * FROM posts WHERE id = $1`, [post_id]);
            if(posts){

                const deletePost = await User.deletePost(post_id, data.id)
                res.status(200).json({message: 'Post deleted Sucessfully', deletePost})
            }
        }

    }catch (e){
        next (e)
    }
})

// Route to like a post 
router.post('/:id/likePost', async function(req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            const {post_id} = req.body
            const likePost = await Post.likePost(data.id, post_id)

            res.status(200).json({likePost})

        }

    }catch (e) {
        next (e)
    }
})

// Route to unlike a Post
router.delete('/:id/unlikePost', async function(req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            const {post_id} = req.body;

            const post = await db.query(`SELECT * FROM posts where id = $1`, [post_id]);
            if(post){
                const unlike = await Post.unlikePost(data.id, post_id);
                unlike;

                res.status(200).json({message: "Post unliked"})
            }

        }

    }catch(e){
        next (e)
    }
})

// Route to comment on posts
router.post('/:id/commentPost', async function(req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            const {post_id, comment} = req.body;

            let commentPost = await Post.addComment(data.id, post_id, comment);
            commentPost = commentPost.rows;
            
            return ({message: "Post has been commented on ", comment: commentPost})
        }

    }catch(e){
        next (e)
    }
})









// Route to just see urgentPosts
router.get('/:id/urgentPosts', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            
            const allPosts = await User.getAllPosts(data.id)
            const posts = allPosts.urgentPosts
            return res.send(posts)

        }

    }catch (e){
        next (e)
    }
})



/**
 * Routes to create all types of posts
 */

// Creates a Urgent post
router.post('/:id/urgentpost', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            const {post, imageUrl, userLocation} = req.body
            const newUrgentPost = await User.createUrgentPost(data.username, post, imageUrl, userLocation)
            
            const extractUrgentPost = newUrgentPost.row.replace(/[()]/g, "").split(',');

            let currentPost = await db.query(
                `SELECT post, imageURL, userLocation FROM urgentposts WHERE id = $1`,
                [extractUrgentPost[0]]
            )

            currentPost = currentPost.rows[0]
            res.status(201).json({message: 'Urgent Post created successfully', currentPost});

        }


    }catch (e){
        next (e);
    }
})


/**
 * Route to delete all the posts
 */

// Delete a urgentPost
router.delete('/:id/deleteUrgentPost', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            const {post_id} = req.body;

            // Checks if post exsist
            const posts = await db.query(`SELECT * FROM urgentPosts WHERE id = $1`, [post_id]);
            if(posts){

                const deletePost = await User.deleteUrgentPost(post_id, data.id)
                res.status(200).json({message: 'Urgent Post deleted Sucessfully', deletePost})
            }
        }

    }catch (e){
        next (e)
    }
})


/**
 * Route to comment on posts / urgent posts / and events
 */




module.exports = router