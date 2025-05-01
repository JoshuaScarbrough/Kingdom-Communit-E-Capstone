const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require("jsonwebtoken");

const { createToken } = require("../helpers/tokens");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const Post = require("../models/posts");

router.get('/', async function (req, res, next){
    res.send("The liked Post route is working")
})
module.exports = router