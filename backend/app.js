const express = require('express');
const app = express();

// Parse requests bodies for JSON
app.use(express.json());

// Adds all the routes
const userRoutes = require('./routes/users');
const userAuth = require('./routes/auth');
const posts = require('./routes/posts');
const urgentPosts = require('./routes/urgentPosts')
const events = require('./routes/events');
const followerFollowing = require('./routes/follower_following');
const likePost = require('./routes/likedPosts')

// app.use for all the routes
app.use('/users', userRoutes);
app.use('/auth', userAuth);
app.use('/posts', posts);
app.use('/urgentPosts', urgentPosts);
app.use('/events', events);
app.use('/follow', followerFollowing);
app.use('/likePost', likePost);


// get request using the get verb
app.get('/', (req, res) => {
    console.log('Joshua Scarbrough')
    return res.send('Kingdom Communit-E Homepage!!')
})


app.listen(3000, function () {
    console.log('Server running on port 3000')
})