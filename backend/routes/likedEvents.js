const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const Event = require('../models/events')

router.get('/', async function (req, res, next){
    res.send("The liked Events route is working")
})

router.get('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            let user = await db.query(
                `SELECT * FROM users WHERE id = $1`,
                [data.id]
            )
            user = user.rows[0]

            let likedEventIds = await db.query(
                `SELECT id from events 
                JOIN eventsLiked ON events.id = eventsLiked.event_id
                WHERE eventsLiked.event_id = $1`,
                [user.id]
            )
            likedEventIds = likedEventIds.rows

            const ids = likedEventIds.map(post => post.id)
            const fullPost = await Promise.all(ids.map(async (id) => await Event.getFullEvent(id)))

            res.send({message: "All liked Events", posts: fullPost  })
        }

    }catch(e){
        next(e)
    }

})

module.exports = router