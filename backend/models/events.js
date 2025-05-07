const db = require('../db.js');
const User = require("../models/user");

class Event{

    // Function to get an Event Post
    static async getEvent(event_id){
        let selectedPost = await db.query(
            `SELECT * FROM events WHERE id = $1`,
            [event_id]
        )
        selectedPost = selectedPost.rows[0]
        return selectedPost
    }

    static async setNumComments(event_id){

        // Selects the post 
        const event = await Event.getEvent(event_id);

        let eventNumComments = event.numcomments

        // Checks to see if their are comments in the database already for the comment
        let commentCheck = await db.query(
            `SELECT * FROM comments WHERE event_id = $1`, 
            [event_id]
        )
        commentCheck = commentCheck.rows

        if(eventNumComments !== commentCheck.length){

            for(let i=0; i< commentCheck.length; i++){
                eventNumComments ++
            }
    
            const setNumComments = await db.query(
                `Update events 
                SET numComments = $1
                WHERE id = $2
                RETURNING numComments`,
                [eventNumComments, event_id]
    
            )
        }

        return(eventNumComments)
        
    }

    static async setNumLikes(event_id){

        // Selects the post 
        const event = await Event.getEvent(event_id);

        let eventNumLikes = event.numlikes

        // Checks to see if their are comments in the database already for the comment
        let likesCheck = await db.query(
            `SELECT * FROM eventsLiked WHERE event_id = $1`, 
            [event_id]
        )
        likesCheck = likesCheck.rows

        if(eventNumLikes !== likesCheck.length){

            for(let i=0; i< likesCheck.length; i++){
                eventNumLikes ++
            }
    
            const setNumLikes = await db.query(
                `Update events 
                SET numLikes = $1
                WHERE id = $2
                RETURNING numComments`,
                [eventNumLikes, event_id]
    
            )
        }

        return(eventNumLikes)

    }

    // Function to like a Event
    static async likeEvent(user_id, event_id){

        // Selects user
        const user = await User.get(user_id)

        // Selects the post
        const event = await Event.getEvent(event_id);

        // Selects event numLikes
        let numLikes = await Event.setNumLikes(event_id)

        // Likes the event
        const like = await db.query(
            `INSERT iNTO eventsLiked (user_id, event_id)
            VALUES ($1, $2) `,
            [user.id, event.id]
        )

        if(like){

            eventLikes = eventLikes + 1;
 
            const updateLikes = await db.query(
                `UPDATE events SET numlikes = $1 WHERE id = $2`,
                [eventLikes, event.id]
            )
            updateLikes;

            return ({message: `${user.username}, has liked a event`, event: event})
        }


    }
    
    // Function to unlike a Event
    static async unlikeEvent(user_id, event_id){

        // Selects user
        const user = await User.get(user_id)

        // Selects the post
        const event = await Event.getEvent(event_id);

        // Selects post numLikes
        let eventLikes = event.numlikes

        let unlike = await db.query(
            `DELETE FROM eventsLiked WHERE user_id = $1 AND event_id = $2`,
            [user.id, event.id]
        )
        unlike;

        if(unlike){
            eventLikes = eventLikes - 1;

            const updateLikes = await db.query(
                `UPDATE events SET numlikes = $1 WHERE id = $2`,
                [eventLikes, event.id]
            )
            updateLikes;

            return({message: "Event Unliked"})

        }

    }

    // Function to comment on a post in the Posts table
    static async addComment(user_id, event_id, comment){
        // Selects user
        const user = await User.get(user_id)

        // Selects the post
        const event = await Event.getEvent(event_id);

        // Selects post numCommens
        let numComments = await Event.setNumComments(event_id)

        // Creates a comment
        let insertComment = await db.query(
            `INSERT INTO comments(user_id, event_id, comment)
            VALUES($1, $2, $3) `,
            [user.id, event.id, comment]

        )
        insertComment;

        // If there is a comment it updates the number of comments on the post table
        if(insertComment){
            numComments = numComments + 1;

            const updateNumComments = await db.query(
                `UPDATE events SET numcomments = $1 WHERE id = $2`, 
                [numComments, event.id]
            )
            updateNumComments;

            return({message: "Commented on post"})

        }
    }

    // Function to see all the comments for a given event in the Events table
    static async getComments(event_id){

        // Selects the post
        const event = await Event.getEvent(event_id);

        // Sets post numComments
        let numComments = await Event.setNumComments(event_id)

        // Views post comments
        const comments = await db.query(
            `SELECT user_id, comment, dateposted, timeposted  
            FROM comments 
            WHERE event_id = $1`,
            [event_id]
        )

        const allComments = comments.rows

        return ({comments: allComments})
    }

    // Function to get a specific event from the user and its comments from the Events table
    static async getFullEvent(event_id){

        const event = await Event.getEvent(event_id)

        // Sets post numComments and NumLikes
        let numComments = await Event.setNumComments(event_id)
        let numLikes = await Event.setNumLikes(event_id)

        const comments = await Event.getComments(event_id)
        const allComments = comments.comments

        if(event){
            const eventAndComments = {
                event: event,
                comments: allComments
            }

            return (eventAndComments)
        }
    }

    // Get all post and their comments from the posts table 
    static async getAllFullEvents(user_id){

        let user = await db.query(
            `SELECT * FROM users WHERE id = $1`,
            [user_id]
        )
        user = user.rows[0]

        let allEvents = await db.query(
            `SELECT id FROM events WHERE user_id = $1`,
            [user_id]
        )
        allEvents = allEvents.rows

        const ids = allEvents.map(event => event.id)

        const fullEvent = await Promise.all(ids.map(async (id) => await Event.getFullEvent(id)))

        return fullEvent
    }

    // Function to comment on an event
}

module.exports = Event