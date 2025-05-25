const express = require('express');
const router = express.Router();
const db = require('../db')
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const UrgentPost = require("../models/urgentPosts")

/**
 * Everything for an Urgent Post
 */

router.get('/', async function (req, res, next){
    res.send("Urgent Posts routes are working");
})

router.get('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            
            const post = await UrgentPost.getAllFullUrgentPosts(data.id)

            return res.send(post)
        }
    }catch(e){
        next (e)
    }
})

// Route to see a specific Event and its comments 
router.post('/:id/specificUrgentPost', async function (req, res, next){
    const {token, urgentPostId} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            const fullPost = await UrgentPost.getFullUrgentPost(urgentPostId)

            if(!fullPost){
                return res.status(404).json({message: "No urgent post found"})
            }else{
                 return res.status(200).send(fullPost)
            }
    
        }

    }catch(e){
        next (e)
    }
})

// Creates an Urgent Post
router.post('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            const {post, imageUrl, userLocation} = req.body
            const newEvent = await User.createUrgentPost(data.username, post, imageUrl, userLocation)

            if(!newEvent){
                return res.status(404).json({message: "No urgent post found"})
            }
            
            const extractEvent = newEvent.row.replace(/[()]/g, "").split(',');

            let currentPost = await db.query(
                `SELECT post, imageURL, userLocation FROM urgentPosts WHERE id = $1`,
                [extractEvent[0]]
            )
            currentPost = currentPost.rows[0]
            
            res.status(201).json({message: 'Urgent Post created successfully', currentPost});


        }


    }catch (e){
        next (e);
    }
})

// Delete an Urgent Post
router.delete('/:id', async function (req, res, next){
    const {token, urgentPostId} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            // Checks if post exsist
            const posts = await db.query(`SELECT * FROM urgentPosts WHERE id = $1`, [urgentPostId]);
            if(posts.rows.length === 0){
                return res.status(404).json({message: "No urgent post found"})
            }
            if(posts){
                const deletePost = await User.deleteUrgentPost(urgentPostId, data.id)
                res.status(200).json({message: 'Urgent Post deleted Sucessfully', deletePost})
            }
        }

    }catch (e){
        next (e)
    }
})

// Route to comment on Urgent Posts
router.post('/:id/commentUrgentPost', async function(req, res, next){
    const {token, urgentPostId, comment} = req.body;
    const data = jwt.verify(token, SECRET_KEY);
    user_id = data.id


    try{

        if(data){

            let commentUrgentPost = await UrgentPost.addComment(user_id, urgentPostId, comment);
            if(!commentUrgentPost){
                return res.status(404).json({message: "No urgent post found"})
            }

            commentUrgentPost = commentUrgentPost.rows;

            return res.status(200).send({message: commentUrgentPost})
        }

    }catch(e){
        next (e)
    }
})

module.exports = router