const db = require('../db.js');
const bcrypt = require("bcrypt");
const axios = require('axios');
const Event = require('./events.js');
const UrgentPost = require('./urgentPosts.js');

const {COORDINATE_API_KEY} = require("../config.js");
const {DISTANCE_API_KEY} = require("../config.js");


class LatLon{

    static async checkAddress(address){

        // This returns undefined just in case the user does not insert an address
        if(address === undefined){
            return undefined
        }

        let coordinatesReq = await axios.get(`https://geocode.maps.co/search?q=${address}&api_key=${COORDINATE_API_KEY}`);
        coordinatesReq = coordinatesReq.data[0]

        if(!coordinatesReq){
            return undefined
        }else{
            console.log("Coordinates are working")
            return true
        }

    }

    // Function to get the coordinates for the user using the page
    static async userCoordinates(id){

        // Grabs the user based upon the id
        let user = await db.query(`SELECT * FROM users WHERE id = $1`, [id])
        user = user.rows[0]

        // Extracts the address from the user
        const userAddress = user.useraddress
        
        let coordinatesReq = await axios.get(`https://geocode.maps.co/search?q=${userAddress}&api_key=${COORDINATE_API_KEY}`);

        coordinatesReq = coordinatesReq.data[0]
        
        const latitude = coordinatesReq.lat
        const longitdue = coordinatesReq.lon
        
        const userCoordinates = {
            latitude: latitude,
            longitdue: longitdue
        }
                
        return userCoordinates
    }


    static async getBothUserCoordinates(user_id, compareUser_id){

        const userCoordinates = await LatLon.userCoordinates(user_id)

        const compareCoordinates = await LatLon.userCoordinates(compareUser_id)

        const coordinatePair = {
            userCoordinates: userCoordinates,
            compareCoordinates: compareCoordinates
        }

        return coordinatePair
    }

    static async getDistanceBetweenUsers(user_id, compareUser_id){

        // Gets the pair of coordinates from the User and the other coordinates
        const coordinates = await LatLon.getBothUserCoordinates(user_id, compareUser_id);

        // Gets the origin lat and long for the API
        const originLatLon = coordinates.userCoordinates
        const originLat = originLatLon.latitude
        const orignLon = originLatLon.longitdue
    
        // Gets the destination lat and long for the API
        const destinationLatLon = coordinates.compareCoordinates
        const destinationLat = destinationLatLon.latitude
        const destinationLon = destinationLatLon.longitdue
        
        // Uses the API to calculate the distance between two users
        let distanceBetween = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destinationLat}%2C${destinationLon}&origins=${originLat}%2C${orignLon}&units=imperial&key=${DISTANCE_API_KEY}`)
        distanceBetween = distanceBetween.data

        return distanceBetween
        
    }

    static async getEventDistance(user_id, event_id){

        // Gets the users lat and long
        const userCoordinates = await LatLon.userCoordinates(user_id);

        // Gets the event and its location
        const event = await Event.getEvent(event_id)
        const eventLocation = event.userlocation

        // Event Coordinates
        let coordinates = await axios.get(`https://geocode.maps.co/search?q=${eventLocation}&api_key=${COORDINATE_API_KEY}`);
        coordinates = coordinates.data[0]

          // Pulls out the lat and longitude from the API
          const latitude = coordinates.lat
          const longitdue = coordinates.lon
  
          // Saves results inside of an object
          const eventCoordinates = {
              latitude: latitude,
              longitdue: longitdue
          }

        // Origin lat and long from the API
        const originLatLon = userCoordinates
        const originLat = originLatLon.latitude
        const orignLon = originLatLon.longitdue

        // Gets the destination lat and long for the API
        const destinationLatLon = eventCoordinates
        const destinationLat = destinationLatLon.latitude
        const destinationLon = destinationLatLon.longitdue


        //Uses the API to calculate the distance between two users
        let distanceBetween = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destinationLat}%2C${destinationLon}&origins=${originLat}%2C${orignLon}&units=imperial&key=${DISTANCE_API_KEY}`)
        distanceBetween = distanceBetween.data
        
        return distanceBetween

    }

    static async getUrgentPostDistance(user_id, post_id){

        // Gets the users lat and long
        const userCoordinates = await LatLon.userCoordinates(user_id);

        // Gets the event and its location
        const urgentPost = await UrgentPost.getUrgentPost(post_id)
        const urgentPostLocation = urgentPost.userlocation

        // Event Coordinates
        let coordinates = await axios.get(`https://geocode.maps.co/search?q=${urgentPostLocation}&api_key=${COORDINATE_API_KEY}`);
        coordinates = coordinates.data[0]

          // Pulls out the lat and longitude from the API
          const latitude = coordinates.lat
          const longitdue = coordinates.lon
  
          // Saves results inside of an object
          const urgentPostCoordinates = {
              latitude: latitude,
              longitdue: longitdue
          }

        // Origin lat and long from the API
        const originLatLon = userCoordinates
        const originLat = originLatLon.latitude
        const orignLon = originLatLon.longitdue

        // Gets the destination lat and long for the API
        const destinationLatLon = urgentPostCoordinates
        const destinationLat = destinationLatLon.latitude
        const destinationLon = destinationLatLon.longitdue


        //Uses the API to calculate the distance between two users
        let distanceBetween = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destinationLat}%2C${destinationLon}&origins=${originLat}%2C${orignLon}&units=imperial&key=${DISTANCE_API_KEY}`)
        distanceBetween = distanceBetween.data
        
        return distanceBetween

    }




}

module.exports = LatLon