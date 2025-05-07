const express = require('express');
const router = express.Router();
const db = require('../db')
const jwt = require("jsonwebtoken");

const { createToken } = require("../helpers/tokens")
const { SECRET_KEY } = require("../config")
const User = require("../models/user");

router.get('/', async function (req, res, next){
    res.send('Follower/Following route working')
})

// Route When you visit another users page
router.get('/')

module.exports = router