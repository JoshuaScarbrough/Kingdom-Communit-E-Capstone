const db = require('../db.js')
const bcrypt = require("bcrypt");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

// Setting the model for the User class
class User {

    // Function to register a User (Used in Register Route)
    static async register(username, userPassword, firstName, lastName, userAddress){

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
            firstName,
            lastName,
            userAddress
            )
            VALUES
            ($1, $2, $3, $4, $5)
            RETURNING
            (username, firstName, lastName, userAddress)`, 
            [username, hashedPassword, firstName, lastName, userAddress],
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

        if(authUser){
            console.log( authUser.username, authUser.userpassword)
        }

        let isValidPassword = await bcrypt.compare(userPassword, authUser.userpassword);
        if(isValidPassword = true){
            return authUser;
        }else {
            console.log("Invalid username / password")
         }

    }
        
}

module.exports = User