const express = require('express');
const app = express();
const cors = require("cors");

// Parse requests bodies for JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Adds all the routes
const userRoutes = require('./routes/users');
const userAuth = require('./routes/auth');
const posts = require('./routes/posts');
const urgentPosts = require('./routes/urgentPosts');
const events = require('./routes/events');
const followerFollowing = require('./routes/follower_following');
const likedPosts = require('./routes/likedPosts');
const likedEvents = require('./routes/likedEvents');
const userFeed = require('./routes/usersFeed');
const messaging = require('./routes/message');


const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    authorization: ('Content-Type', 'Authorization'),
    credentials: true,
    exposedHeaders:( 'Content-Type', 'Authorization')
}
app.use(cors(corsOptions));

app.use(express.json());
app.use('/users', userRoutes);
app.use('/auth', userAuth);
app.use('/posts', posts);
app.use('/urgentPosts', urgentPosts);
app.use('/events', events);
app.use('/follow', followerFollowing);
app.use('/likedPosts', likedPosts);
app.use('/likedEvents', likedEvents);
app.use('/feed', userFeed);
app.use('/messaging', messaging);

// get request using the get verb
app.get('/', (req, res) => {
    console.log('Joshua Scarbrough')
    return res.send('Kingdom Communit-E Homepage!!')
})

if (process.env.NODE_ENV !== 'test'){
    app.listen(5000, function () {
    console.log('Server running on port 5000')
    });
}

app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  res.status(status).json({
    error: {
      message,
      status
    }
  });
});

module.exports = app;