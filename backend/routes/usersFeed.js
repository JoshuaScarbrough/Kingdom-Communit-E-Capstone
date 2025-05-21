const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const Post = require("../models/posts");
const LatLon = require("../models/latLon");

// User feed dummy route
router.get('/', async function (req, res, next){
    res.send("User Feed route is working");
})

router.post('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            let user = await User.get(data.id)

            const feed = await Post.getAllFeedPosts()
            const followingFeed = await Post.getAllFollowingFeedPosts(data.id)
            const allUrgentPosts = feed.fullUrgentPost

            const fullFeed = {
                feed: feed,
                followingFeed: followingFeed,
                urgentPosts: allUrgentPosts
            }

            return res.send(fullFeed)
        }

    }catch (e){
        next(e)
    }

})

router.get('/:id/event', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        const {event_id} = req.body

        if(data){
            const eventDistance = await LatLon.getEventDistance(data.id, event_id);

            // Extracts the mialage out of the response
            let distanceMiles = eventDistance.rows
            distanceMiles = distanceMiles[0].elements[0].distance.text

            // Converts the miles string into a float and rounds it up
            const distanceMilesNum = parseFloat(distanceMiles)
            const roundUp = Math.ceil(distanceMilesNum)

            return res.send(`Event within ${roundUp} miles from your Home`)
        }

    }catch(e){
        next (e)
    }
})

router.get('/:id/urgentPost', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        const {urgentPost_id} = req.body

        if(data){
            const urgentPostDistance = await LatLon.getUrgentPostDistance(data.id, urgentPost_id)

            // Extracts the mialage out of the response
            let distanceMiles = urgentPostDistance.rows
            distanceMiles = distanceMiles[0].elements[0].distance.text

            // Converts the miles string into a float and rounds it up
            const distanceMilesNum = parseFloat(distanceMiles)
            const roundUp = Math.ceil(distanceMilesNum)

            // If roundup is within 15 miles from you then highlight the Urgent Post red

            return res.send(`Hurry!!! Help is needed within ${roundUp} miles from your Home`)

        }

    }catch(e){
        next (e)
    }
})


module.exports = router