const db = require('../db.js');
const bcrypt = require("bcrypt");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

// Setting the model for the User class
class User {

    // Function to register a User (Used in Register Route)
    static async register(username, userPassword, userAddress){

        const duplicateCheck = await db.query(
            `SELECT username FROM users WHERE username = $1`, [username],);

        if (duplicateCheck.rows[0]){
            console.log("Duplicate Value")
        }

        const hashedPassword = await bcrypt.hash(userPassword, BCRYPT_WORK_FACTOR);

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

    // Function to authenticate a User (Used in a Login route)
    static async authenticate(username, userPassword){

        // try to find the user first
        const results = await db.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
         );

        const authUser = results.rows[0];

        let isValidPassword = await bcrypt.compare(userPassword, authUser.userpassword);
        if(isValidPassword = true){
            delete authUser.userpassword
            return authUser;
        }else {
            console.log("Invalid username / password")
         }

    }

    // Need an update route
    static async update(username, firstName, lastName, userAddress, profilePictureURL, coverPhotoURL){


    }

    static async getAllPosts(user_id){
        let user = await db.query(
            `SELECT id, username FROM users WHERE id = $1`,
            [user_id]
        )

        user = user.rows[0]

        if(user){

            let posts = await db.query(
                `SELECT * FROM posts WHERE user_id = $1`,
                [user.id]
            )
            posts = posts.rows

            let urgentPosts = await db.query(
                `SELECT * FROM urgentPosts WHERE user_id = $1`,
                [user.id]
            )
            urgentPosts = urgentPosts.rows

            let events = await db.query(
                `SELECT * FROM events WHERE user_id = $1`,
                [user.id]
            )
            events = events.rows

            // Return a object off all the posts
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

    static async createPost( username, post, imageURL){

        let user = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        )

        user = user.rows[0]

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

    // Need an remove route 

    // Need a route to follow a user

    // Need a route to create a post 

    // Need a route to create a urgentPost

    // Need a route to create a 
        
}

module.exports = User