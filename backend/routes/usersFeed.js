const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const Post = require("../models/posts");
const LatLon = require("../models/latLon");


// Gets the feed for the user
router.post('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            const feed = await Post.getAllFeedPosts()
            if(!feed){
                return res.status(404).send("No posts found")
            }

            const followingFeed = await Post.getAllFollowingFeedPosts(data.id)
            if(!followingFeed){
                return res.status(404).send("No following posts found")
            }

            const allUrgentPosts = feed.fullUrgentPost
            if(!allUrgentPosts){
                return res.status(404).send("No urgent posts found")
            }

            const fullFeed = {
                feed: feed,
                followingFeed: followingFeed,
                urgentPosts: allUrgentPosts
            }

            return res.status(200).send(fullFeed)
        }

    }catch (e){
        next(e)
    }

})

// Gets the distance of the event from the address of the user and the event
router.post('/:id/event', async function (req, res, next){
    const {token, eventId} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            const eventDistance = await LatLon.getEventDistance(data.id, eventId);
            if(!eventDistance){
                return res.status(404).send("No event found")
            }

            // Extracts the mialage out of the response
            let distanceMiles = eventDistance.rows
            distanceMiles = distanceMiles[0].elements[0].distance.text

            // Converts the miles string into a float and rounds it up
            const distanceMilesNum = parseFloat(distanceMiles)
            const roundUp = Math.ceil(distanceMilesNum)

            return res.status(200).send(`Event within ${roundUp} miles from your Address`)
        }

    }catch(e){
        next (e)
    }
})

// Gets the distance of the urgent post from the address of the user and the event
router.post('/:id/urgentPost', async function (req, res, next){
    const {token, urgentPostId} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{


        if(data){
            const urgentPostDistance = await LatLon.getUrgentPostDistance(data.id, urgentPostId)
            if(!urgentPostDistance){
                return res.status(404).send("No urgent post found")
            }   

            // Extracts the mialage out of the response
            let distanceMiles = urgentPostDistance.rows
            distanceMiles = distanceMiles[0].elements[0].distance.text

            // Converts the miles string into a float and rounds it up
            const distanceMilesNum = parseFloat(distanceMiles)
            const roundUp = Math.ceil(distanceMilesNum)

            // If roundup is within 15 miles from you then highlight the Urgent Post red
            return res.status(200).send(`Hurry!!! Help is needed within ${roundUp} miles from your Address`)

        }

    }catch(e){
        next (e)
    }
})


module.exports = router