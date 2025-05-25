const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const Post = require("../models/posts");

// Route to get all liked posts
router.post('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            let user = await db.query(
                `SELECT * FROM users WHERE id = $1`,
                [data.id]
            )
            user = user.rows[0]

            if(!user){
                return res.status(404).send("User not found")
            }

            let likedPostIds = await db.query(
                `SELECT id from posts 
                JOIN postsLiked ON posts.id = postsLiked.post_id
                WHERE postsLiked.user_id = $1`,
                [user.id]
            )
            likedPostIds = likedPostIds.rows

            const ids = likedPostIds.map(post => post.id)
            const fullPost = await Promise.all(ids.map(async (id) => await Post.getFullPost(id)))

            res.status(200).send({message: "All liked Posts", posts: fullPost  })
        }

    }catch(e){
        next(e)
    }

})

module.exports = router