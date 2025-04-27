const express = require('express');
const router = express.Router();
const db = require('../db')
const jwt = require("jsonwebtoken");

const { createToken } = require("../helpers/tokens")
const { SECRET_KEY } = require("../config")
const User = require("../models/user");


/**
 * I want these routes to be for creating posts, urgentPosts, and events
 */

router.get('/', async function (req, res, next){
    res.send("Post routes are working");
})

// See all the post by a user *Working*
router.get('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            
            const allPosts = await User.getAllPosts(data.id)
            return res.send(allPosts)

        }

    }catch (e){
        next (e)
    }
})

// Route to just see posts
router.get('/:id/posts', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            
            const allPosts = await User.getAllPosts(data.id)
            const posts = allPosts.posts
            return res.send(posts)

        }

    }catch (e){
        next (e)
    }
})


// Route to just see userPosts
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

// Route to just see events
router.get('/:id/events', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            
            const allPosts = await User.getAllPosts(data.id)
            const posts = allPosts.events
            return res.send(posts)

        }

    }catch (e){
        next (e)
    }
})

// Create a post
router.post('/:id/post', async function (req, res, next){
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

// Creates a Urgent post
router.post('/:id/urgentpost', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

        }


    }catch (e){
        next (e);
    }
})

// Creates an Event
router.post('/:id/event', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

        }


    }catch (e){
        next (e);
    }
})




module.exports = router