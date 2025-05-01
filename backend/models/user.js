const db = require('../db.js');
const Post = require('../models/posts.js')
const UrgentPost = require('../models/urgentPosts.js');
const Event = require('../models/events.js')

const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");


// Setting the model for the User class
class User {

    // Function to register a User (Used in auth Route)
    static async register(username, userPassword, userAddress){

        // Makes sure there arent duplicate usernames being used in registration
        const duplicateCheck = await db.query(
            `SELECT username FROM users WHERE username = $1`, [username],);

        if (duplicateCheck.rows[0]){
            console.log("Duplicate Value")
        }

        // Used to hash passwords for security
        const hashedPassword = await bcrypt.hash(userPassword, BCRYPT_WORK_FACTOR);

        // Inserts user into database
        const results = await db.query(
            `INSERT INTO users
            (username,
            userPassword,
            userAddress
            )
            VALUES
            ($1, $2, $3)
            RETURNING
            ( username, userAddress)`, 
            [username, hashedPassword, userAddress],
        );

        const user = results.rows[0];
        return user;

    }

    // Function to authenticate a User (Used in auth route)
    static async authenticate(username, userPassword){

        // try to find the user first
        const results = await db.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
         );
        const authUser = results.rows[0];

        // Uses bcrypt to compare encoded password with password the user entered
        let isValidPassword = await bcrypt.compare(userPassword, authUser.userpassword);
        if(isValidPassword = true){
            delete authUser.userpassword
            return authUser;
        }else {
            console.log("Invalid username / password")
         }

    }

    // Returns a user from the database
    static async get(user_id){
        let user = await db.query(
            `SELECT * FROM users WHERE id = $1`,
            [user_id]
        )
        user = user.rows[0]
        return user
    }

    // Function that gets all posts regardless of the post type dependant upon the user
    static async getAllPosts(user_id){

        // Gets the user to get all their posts
        let user = await db.query(
            `SELECT id, username FROM users WHERE id = $1`,
            [user_id]
        )
        user = user.rows[0]

        if(user){

            // Selects all posts
            const posts = await Post.getAllFullPosts(user.id);

            // Selects all urgent posts
            const urgentPosts = await UrgentPost.getAllFullUrgentPosts(user.id);

            // Selects all events
            const events = await Event.getAllFullEvents(user.id);

            // creates a object off all the posts
            const allPosts = {
                posts: posts,
                urgentPosts: urgentPosts,
                events: events
            }

            return (allPosts)

        }else{
            console.log("No user")
        }

    }

    // Create a Post
    static async createPost( username, post, imageURL){

        // Selects the user
        let user = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        )
        user = user.rows[0]

        // Inserts a post into the table
        const results = await db.query(
            `INSERT INTO posts
            (user_ID,
            post,
            imageURL
            )
            VALUES
            ($1, $2, $3)
            RETURNING
            (id, post, imageURL)`,
            [user.id, post, imageURL]
        )

        post = results.rows[0]
        return post
    }

    // Delete a Post
    static async deletePost(post_id, user_id){
        const results = await db.query(
            `DELETE FROM posts WHERE id = $1 AND user_id = $2`,
            [post_id, user_id]
        )
        return results.rows[0]
    }


    // Create Urgent Post 
    static async createUrgentPost( username, post, imageURL, userLocation){

        let user = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        )

        user = user.rows[0]

        const results = await db.query(
            `INSERT INTO urgentPosts
            (user_ID,
            post,
            imageURL,
            userLocation
            )
            VALUES
            ($1, $2, $3, $4)
            RETURNING
            (id, post, imageURL)`,
            [user.id, post, imageURL, userLocation]
        )

        post = results.rows[0]
        return post
    }

     // Delete a UrgentPost
     static async deleteUrgentPost(post_id, user_id){
        const results = await db.query(
            `DELETE FROM urgentPosts WHERE id = $1 AND user_id = $2`,
            [post_id, user_id]
        )
        return results.rows[0]
    }


      // Creates an Event
      static async createEvent( username, post, imageURL, userLocation){

        let user = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        )

        user = user.rows[0]

        const results = await db.query(
            `INSERT INTO events
            (user_ID,
            post,
            imageURL,
            userLocation
            )
            VALUES
            ($1, $2, $3, $4)
            RETURNING
            (id, post, imageURL)`,
            [user.id, post, imageURL, userLocation]
        )

        post = results.rows[0]
        return post
    }

    // Delete a Event
    static async deleteEvent(post_id, user_id){
        const results = await db.query(
            `DELETE FROM events WHERE id = $1 AND user_id = $2`,
            [post_id, user_id]
        )
        return results.rows[0]
    }

    // Need a route to follow a user
    static async followUser(follower_id, following_id){ // follower_id is the user that is following, following_id is the user that is being followed 
        const results = await db.query( // insert the follower_id and following_id into the followers table
            `INSERT INTO followers(follower_ID, following_ID)  -- follower_id is the user that is following, following_id is the user that is being followed 
            VALUES ($1, $2) -- insert the follower_id and following_id into the followers table
            RETURNING follower_ID, following_ID`, // return the follower_id and following_id
            [follower_id, following_id] // insert the follower_id and following_id into the followers table
        )
        return results.rows[0] // return the follower_id and following_id
    }
        
}

module.exports = User