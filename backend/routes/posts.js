const express = require('express');
const router = express.Router();
const db = require('../db')
const jwt = require("jsonwebtoken");

const { createToken } = require("../helpers/tokens")
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const Post = require("../models/posts")

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
            console.log("Post", post)

            if(!post){
                return res.status(404).json({message: "No posts found"})
            }else{
                return res.status(200).json({message: "Posts found", post})
            }
    
        }

    }catch(e){
        next (e)
    }
})

// Route to see a specific post and its comments 
router.post('/:id/specificPost', async function (req, res, next){
    const {token, postId} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){


            const fullPost = await Post.getFullPost(postId)

            if(!fullPost){
                return res.status(404).json({message: "No post found"}) 
            }else{
                 return res.status(200).send(fullPost)
            }
            
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

            const {post} = req.body

            if(!post){
                return res.status(400).json({message: "Post is required"})
            }

            const newPost = await User.createPost(data.username, post)

            if(!newPost){
                return res.status(400).json({message: "Post not created"})
            }

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
    const {token, postId} = req.body;
    const data = jwt.verify(token, SECRET_KEY);
    
    try{

        if(data){

            // Checks if post exsist
            const posts = await db.query(`SELECT * FROM posts WHERE id = $1`, [postId]);

            if(!posts){
                return res.status(404).json({message: "Post not found"})
            }
            if(posts){

                const deletePost = await User.deletePost(postId, data.id)
                res.status(200).json({message: 'Post deleted Sucessfully', deletePost})
            }
        }

    }catch (e){
        next (e)
    }
})

// Route to like a post 
router.post('/:id/likePost', async function(req, res, next){
    const {token, postId} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            const likePost = await Post.likePost(data.id, postId)

            if(!likePost){
                return res.status(404).json({message: "Post not found"})
            }else{
                return res.status(200).json({likePost})
            }

        }

    }catch (e) {
        next (e)
    }
})

// Route to unlike a Post
router.delete('/:id/unlikePost', async function(req, res, next){
    const {token, postId} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            const post = await db.query(`SELECT * FROM posts where id = $1`, [postId]);
            if(post){
                const unlike = await Post.unlikePost(data.id, postId);
                unlike;

                res.status(200).json({message: "Post unliked"})
            }else{
                return res.status(404).json({message: "Post not found"})
            }

        }

    }catch(e){
        next (e)
    }
})

// Route to comment on posts
router.post('/:id/commentPost', async function(req, res, next){
    const {token, postId, comment} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            let commentPost = await Post.addComment(data.id, postId, comment);

            if(!commentPost){
                return res.status(404).json({message: "Post not found"})
            }else{
                return res.status(200).json({message: "Comment added", commentPost})
            }
        }

    }catch(e){
        next (e)
    }
})

module.exports = router