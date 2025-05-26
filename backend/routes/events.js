/**
 * I handle all our event-related routes here.
 * 
 * I did some fixes while testing:
 * 1. I fixed a bug in the DELETE route - it wasn't checking events right
 * 2. I made the error messages match what the tests expect
 * 3. I added return statements to avoid multiple responses
 * 4. I cleaned up how we handle errors
 */

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
router.post('/:id/specificEvent', async function (req, res, next){
    const {token, eventId} = req.body;
    console.log(token, eventId)
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            const fullPost = await Event.getFullEvent(eventId)

            if(!fullPost){
                return res.status(404).json({message: "No event found"})
            }else{
                return res.status(200).send(fullPost)
            }
    
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

            if(!newEvent){
                return res.status(404).json({message: "Event not created"})
            }
            
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
    const {token, eventId} = req.body;
    console.log(token, eventId)
    const data = jwt.verify(token, SECRET_KEY);

    try{
        if(data){
            // I fixed this to properly check rows.length
            const event = await db.query(`SELECT * FROM events WHERE id = $1`, [eventId]);
            if(event.rows.length > 0){
                const deletePost = await User.deleteEvent(eventId, data.id)
                if(deletePost){
                    // I fixed the response to match test expectations
                    return res.status(200).json({message: 'Event deleted Sucessfully', deletePost})
                }else{
                    return res.status(404).json({message: "Event not found"})
                }
            }else{
                return res.status(404).json({message: "Event not found"})
            }
        }
    }catch (e){
        next (e)
    }
})

// Route to like an Event 
router.post('/:id/likeEvent', async function(req, res, next){
    const {token, eventId} = req.body;
    console.log("TOKENANDID", token, eventId)
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            const likeEvent = await Event.likeEvent(data.id, eventId)

            if(!likeEvent){
                return res.status(404).json({message: "Event not found"})
            }
            if(likeEvent === "Already liked"){
                return res.status(404).json({message: "Event already liked"})
            }else{
                return res.status(200).json({likeEvent})
            }

        }

    }catch (e) {
        next (e)
    }
})

// Route to unlike an Event
router.delete('/:id/unlikeEvent', async function(req, res, next){
    const {token, eventId} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            // Selects event to check to see if Valid
            const event = await db.query(`SELECT * FROM events WHERE id = $1`, [eventId]);
            if(event){
                const unlike = await Event.unlikeEvent(data.id, eventId);
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
    const {token, eventId, comment} = req.body;
    const data = jwt.verify(token, SECRET_KEY);
    user_id = data.id

    try{

        if(data){

            let commentEvent = await Event.addComment(user_id, eventId, comment);
            if(!commentEvent){
                return res.status(404).json({message: "Event not found"})
            }

            commentEvent = commentEvent.rows;
            return res.status(200).send({message: commentEvent})
        }

    }catch(e){
        next (e)
    }
})

module.exports = router