const express = require('express');
const router = express.Router();
const db = require('../db')
const jwt = require("jsonwebtoken");

const { createToken } = require("../helpers/tokens")
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const Post = require("../models/posts");

/**
 * Route used to be able for users to message eachother
 */

router.get('/', async function (req, res, next){
    res.send("Messaging routes are working");
})

router.get('/:id/veiwMessages/:messagingId', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        const {deliveredTo} = req.body

        if(data){

            const lehGo = []
            let message
            
            let userMessages = await db.query(
                `SELECT userMessage, dateSent, timeSent FROM messages WHERE deliveredTo_id = $1`,
                [deliveredTo]
            )
            userMessages = userMessages.rows

            let otherUser = await db.query(
                `SELECT userMessage, dateSent, timeSent FROM messages WHERE deliveredTo_id = $1`,
                [data.id]
            )
            otherUser = otherUser.rows

            if(userMessages){
                message = userMessages
                lehGo.push(message)
            }
            
            if(otherUser){
                message = otherUser
                lehGo.push(message)
            }


            const messageThread = {
                user: userMessages,
                otherUser: otherUser
            }

            return res.send(lehGo)
        }

    }catch(e){
        next(e)
    }
})

router.post('/:id/message/:messagingId', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        const {deliveredTo, message} = req.body

        if(data){

            const messageUser = await db.query(
                `INSERT INTO messages(user_id, deliveredTo_id, userMessage)
                VALUES($1, $2, $3)`,
                [data.id, deliveredTo, message]
            )

            return res.send({message: "Message has been sent"})
        }


    }catch(e){
        next(e)
    }
})


module.exports = router