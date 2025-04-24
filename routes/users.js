const express = require('express');
const router = express.Router();
const db = require('../db')
const User = require("../models/user");

router.get('/', async function getAllUsers (req, res, next){
    try {
        const results = await db.query(
            'SELECT * FROM users'
        );
        return res.json(results.rows)
    } catch (e) {
        return next (e);
    }
})

// Syntax /search?id=1
// Please change this, used to text my data
router.get('/search', async function getUser (req, res, next){
    try {
        const { id } = req.query;
        const results = await db.query(
            `SELECT * FROM users WHERE id=$1`, [id]
        );
        return res.json(results.rows)
    } catch (e) {
        return next (e);
    }
})

// router.patch('/:id', async function editUser (req, res, next){
//     try{
        
//     }catch(e){

//     }
// })



module.exports = router;