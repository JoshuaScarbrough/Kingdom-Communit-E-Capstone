const express = require('express');
const router = express.Router();
const db = require('../db')
const jwt = require("jsonwebtoken");

const { createToken } = require("../helpers/tokens")
const { SECRET_KEY } = require("../config")
const User = require("../models/user");
const LatLon = require("../models/latLon")


// Route that shows all followers a user has (This is on the users page)
router.post('/:id/followers', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    if(data){

        // Selects the user
        const user = await User.get(data.id);
        if(!user){
            return res.status(404).send({message: "User not found"})
        }

        // Query string to select all the users followers
        const results = await db.query(
            `SELECT users.username 
            FROM users 
            JOIN followers ON users.id = followers.follower_id
            WHERE followers.following_id = $1`,
            [user.id]
        )

        const followers = results.rows
        res.status(200).send({message: `List of all ${user.username}'s followers`, followers: followers})
    }
})

// Route that shows all the users a user is following
router.post('/:id/following', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    if(data){

        // Selects the user
        const user = await User.get(data.id);

        // Query string to select all the users a user is following
        const results = await db.query(
            `SELECT users.username 
            FROM users 
            JOIN followers ON users.id = followers.following_id
            WHERE followers.follower_id = $1`,
            [user.id]
        )

        const following = results.rows
        res.send({message: `List of all users ${user.username} is following`, following: following})
    }
})

// Route that allows a user to follow 
router.post('/:id/addUser', async function (req, res, next){
    const {token, otherId} = req.body;
    console.log(token , otherId)
    const data = jwt.verify(token, SECRET_KEY);

    if(data){

        // Allows the user to follow another user
        const addUser = await User.followUser(data.id, otherId);

        res.send(addUser)

    }
})

// Route that allows you to stop following someone
router.delete('/:id/unfollow', async function (req, res, next){

        // user that you want to unfollow
        const {username, userId} = req.body
        console.log(username, userId)

        let unfollowingUser = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
        unfollowingUser = unfollowingUser.rows
        
        const extractedId = unfollowingUser[0].id
        console.log(extractedId)
        
        let unfollow = await db.query(
            `DELETE FROM followers WHERE follower_id = $1 AND following_id = $2`,
            [userId, extractedId]
        )
        
        res.send({message: `Successfully unfollowed user `})

    
})

// You get to see another users page and you also have the ability to follow/unfollow them 
router.post('/:id/view/:otherid', async function (req, res, next){
    const {token, otherId} = req.body;
    console.log("Making sure we get the correct data", token, otherId )
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){


            // Getting that user so you can display their data
            const otherUsr = await User.get(otherId)


            // Pulling all their post
            const otherUsrPost = await User.getAllPosts(otherId)

            // Finds the distance between Users
            const distanceBetween = await LatLon.getDistanceBetweenUsers(data.id, otherId)

            // Extracts the mialage out of the response
            let distanceMiles = distanceBetween.rows
            distanceMiles = distanceMiles[0].elements[0].distance.text

            // Converts the miles string into a float and rounds it up
            const distanceMilesNum = parseFloat(distanceMiles)
            const roundUp = Math.ceil(distanceMilesNum)
            console.log(roundUp)

            // Returning their page so that you have the option to follow or unfollow
            return res.json({
                otherUsr: {
                    id: otherUsr.id,
                    user: otherUsr.username,
                    userBio: otherUsr.bio, 
                    profilePic: otherUsr.profilepictureurl, 
                    coverPhoto: otherUsr.coverphotourl
                },
                otherUsrPosts: otherUsrPost,
                distanceMiles: `Within ${roundUp} miles of You!!`
            })

        }

    }catch(e){
        next(e)
    }


})

router.get('/:id/view/:otherid/followers', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            // The user your visitings page
            const {other_id} = req.body

            // Selects the user
            const user = await User.get(other_id);

            // Query string to select all the users followers
            const results = await db.query(
                `SELECT users.username 
                FROM users 
                JOIN followers ON users.id = followers.follower_id
                WHERE followers.following_id = $1`,
                [other_id])  

            const followers = results.rows
            res.send({msg: "List of all followers", followers: followers})
        }


    }catch(e){
        next(e)
    }
})

router.get('/:id/view/:otherid/following', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            // The user your visitings page
            const {other_id} = req.body

            // Selects the user
            const user = await User.get(other_id);

            // Query string to select all the users a user is following
            const results = await db.query(
            `SELECT users.username 
            FROM users 
            JOIN followers ON users.id = followers.following_id
            WHERE followers.follower_id = $1`,
            [user.id]
            )

            const following = results.rows
            res.send({msg: "List of all users following", following: following})
        }


    }catch(e){
        next(e)
    }
})

// Route that allows a user to follow the other user
router.post('/:id/follow/:id/follow', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    if(data){

        const {other_id} = req.body;

        // Allows the user to follow another user
        const addUser = await User.followUser(data.id, other_id);

        res.send(addUser)

    }
})

// Route that allows you to stop following someone
router.delete('/:id/unfollow/:id/unfollow', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    if(data){
        // user that you want to unfollow
        const {other_id} = req.body

        let unfollow = await db.query(
            `DELETE FROM followers WHERE follower_id = $1 AND following_id = $2`,
            [data.id, other_id]
        )
        
        res.send({message: `Successfully unfollowed user `})

    }
})


module.exports = router