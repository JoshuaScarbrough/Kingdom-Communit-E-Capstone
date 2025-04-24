const express = require('express');
const app = express();

// Parse requests bodies for JSON
app.use(express.json());

// Adds all the routes
const userRoutes = require('./routes/users');
const userAuth = require('./routes/auth')

// app.use for all the routes
app.use('/users', userRoutes);
app.use('/auth', userAuth);


// get request using the get verb
app.get('/', (req, res) => {
    console.log('Joshua Scarbrough')
    return res.send('Kingdom Communit-E Homepage!!')
})








app.listen(3000, function () {
    console.log('Server running on port 3000')
})