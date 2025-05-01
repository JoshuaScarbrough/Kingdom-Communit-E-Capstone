const express = require('express');
const router = express.Router();
const db = require('../db')
const jwt = require("jsonwebtoken");

const { createToken } = require("../helpers/tokens")
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const Event = require("../models/events");

/**
 * Everything for an Event
 */

router.get('/', async function (req, res, next){
    res.send("Event routes are working");
})

router.get('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            
            const event = await Event.getAllFullEvents(data.id)

            return res.send(event)
        }
    }catch(e){
        next (e)
    }
})

// Route to see a specific Event and its comments 
router.get('/:id/specificEvent', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        const {event_id} = req.body;

        if(data){

            const fullPost = await Event.getFullEvent(event_id)
    
            return res.send(fullPost)
        }

    }catch(e){
        next (e)
    }
})

// Creates an Event
router.post('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            const {post, imageUrl, userLocation} = req.body
            const newEvent = await User.createEvent(data.username, post, imageUrl, userLocation)
            
            const extractEvent = newEvent.row.replace(/[()]/g, "").split(',');

            let currentPost = await db.query(
                `SELECT post, imageURL, userLocation FROM events WHERE id = $1`,
                [extractEvent[0]]
            )
            currentPost = currentPost.rows[0]
            
            res.status(201).json({message: 'Event created successfully', currentPost});


        }


    }catch (e){
        next (e);
    }
})

// Delete an event
router.delete('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            const {event_id} = req.body;

            // Checks if post exsist
            const event = await db.query(`SELECT * FROM events WHERE id = $1`, [event_id]);
            if(event){

                const deletePost = await User.deleteEvent(event_id, data.id)
                res.status(200).json({message: 'Event deleted Sucessfully', deletePost})
            }
        }

    }catch (e){
        next (e)
    }
})

// Route to like an Event 
router.post('/:id/likeEvent', async function(req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            const {event_id} = req.body
            const likeEvent = await Event.likeEvent(data.id, event_id)

            res.status(200).json({likeEvent})

        }

    }catch (e) {
        next (e)
    }
})

// Route to unlike an Event
router.delete('/:id/unlikeEvent', async function(req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
          
            const {event_id} = req.body;

            // Selects event to check to see if Valid
            const event = await db.query(`SELECT * FROM events WHERE id = $1`, [event_id]);
            if(event){
                const unlike = await Event.unlikeEvent(data.id, event_id);
                unlike;

                res.status(200).json({message: "Event unliked"})
            }

        }

    }catch(e){
        next(e)
    }

})

// Route to comment on events
router.post('/:id/commentEvent', async function(req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            const {event_id, comment} = req.body;

            let commentEvent = await Event.addComment(data.id, event_id, comment);
            commentEvent = commentEvent.rows;

            return ({message: "Post has been commented on ", comment: commentEvent})
        }

    }catch(e){
        next (e)
    }
})

module.exports = router