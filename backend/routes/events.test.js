/**
 * I test all our event-related routes here.
 * 
 * I did some improvements on this:
 * 1. I added cleanup for our database connections
 * 2. I fixed the DELETE tests to match our route changes:
 *    - Better event checking
 *    - Matching error messages
 *    - Right status codes
 * 3. I added comments to explain what's happening
 * 4. I made the test setup cleaner
 */

const request = require('supertest');
const express = require('express');
const router = require('../routes/events');

// Got all the stuff we need for testing
const db = require('../db');
const jwt = require('jsonwebtoken');
const { createToken } = require('../helpers/tokens');
const User = require('../models/user');
const Event = require('../models/events');
const { SECRET_KEY } = require("../config");

// I mocked these so tests don't hit the database
jest.mock('../db');
jest.mock('jsonwebtoken');
jest.mock('../helpers/tokens');
jest.mock('../models/user')
jest.mock('../models/events');

let app;

// Set up before testing
beforeAll(async () => {
  // Made our test app with the middleware it needs
  app = express();
  app.use(express.json());
  app.use('/events', router);
});

// Clean up after testing
afterAll(async () => {
  // Close database connections
  await db.endDb();
});

describe("POST /events/:id/specificEvent", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  test("should return 200 and the full event when an event is found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    // Simulate token verification returning valid payload data.
    jwt.verify.mockReturnValue({ id: 1 });
    
    // Simulate Event.getFullEvent returning a fake event object.
    const fakeEvent = { id: 123, name: "Test Event", description: "Details about the event" };
    Event.getFullEvent.mockResolvedValue(fakeEvent);

    // Act: Send a POST request to /events/1/specificEvent with token and eventId.
    const response = await request(app)
      .post("/events/1/specificEvent")
      .send({ token: fakeToken, eventId: 123 });
    
    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Event.getFullEvent).toHaveBeenCalledWith(123);
    expect(response.status).toBe(200);
    // Since the route uses res.send(fullPost) to return the event, we expect the response body to equal fakeEvent.
    expect(response.body).toEqual(fakeEvent);
  });

  test("should return 404 with an error message when no event is found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });
    
    // Simulate Event.getFullEvent returning a falsey value.
    Event.getFullEvent.mockResolvedValue(null);
    
    // Act: Send a POST request with an eventId that does not exist.
    const response = await request(app)
      .post("/events/1/specificEvent")
      .send({ token: fakeToken, eventId: 999 });
    
    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Event.getFullEvent).toHaveBeenCalledWith(999);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "No event found" });
  });
});


describe("POST /events/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create an event successfully (201) and return the event details", async () => {
    // Arrange: simulate valid token verification
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ username: "testuser" });
    
    // Simulate a successful event creation by the User model.
    // The returned object has a 'row' property that is a string containing the event id.
    const newEvent = { row: "(101,someData)" };
    User.createEvent.mockResolvedValue(newEvent);
    
    // Simulate a database query that returns event details.
    const fakeCurrentEvent = {
      post: "Event Description",
      imageURL: "http://example.com/img.jpg",
      userLocation: "Phenix City"
    };
    db.query.mockResolvedValue({ rows: [fakeCurrentEvent] });
    
    // Act: Send a POST request with the required parameters.
    const response = await request(app)
      .post("/events/1")
      .send({
        token: fakeToken,
        post: "Event Description",
        imageUrl: "http://example.com/img.jpg",
        userLocation: "Phenix City"
      });
    
    // Assert:
    // Check that the token was verified correctly.
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    // Verify that User.createEvent was called with proper parameters.
    expect(User.createEvent).toHaveBeenCalledWith("testuser", "Event Description", "http://example.com/img.jpg", "Phenix City");
    // The createEvent returns a row of "(101,someData)"; extract "101" and use it in the query.
    expect(db.query).toHaveBeenCalledWith(
      "SELECT post, imageURL, userLocation FROM events WHERE id = $1", 
      ["101"]
    );
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Event created successfully",
      currentPost: fakeCurrentEvent
    });
  });

  test("should return 404 if the event is not created", async () => {
    // Arrange: simulate valid token verification.
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ username: "testuser" });
    
    // Simulate failure by having User.createEvent return a falsy value.
    User.createEvent.mockResolvedValue(null);
    
    // Act: Send a POST request.
    const response = await request(app)
      .post("/events/1")
      .send({
        token: fakeToken,
        post: "Event Description",
        imageUrl: "http://example.com/img.jpg",
        userLocation: "Phenix City"
      });
    
    // Assert:
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Event not created" });
  });
});


describe("DELETE /events/:id", () => {
  beforeEach(() => {
    // Start fresh each test
    jest.clearAllMocks();
  });

  test("should delete the event successfully and return 200", async () => {
    const fakeToken = "validtoken";
    const fakePayload = { id: 1 };
    jwt.verify.mockReturnValue(fakePayload);
    
    // I updated this to include rows for proper event checking
    const fakeEvent = { id: 300, event: "Sample Event" };
    db.query.mockResolvedValueOnce({ rows: [fakeEvent] });
    
    const fakeDeleteResponse = { deleted: true };
    User.deleteEvent.mockResolvedValueOnce(fakeDeleteResponse);
    
    const response = await request(app)
      .delete("/events/1")
      .send({ token: fakeToken, eventId: 300 });
    
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(db.query).toHaveBeenCalledWith("SELECT * FROM events WHERE id = $1", [300]);
    expect(User.deleteEvent).toHaveBeenCalledWith(300, fakePayload.id);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Event deleted Sucessfully",
      deletePost: fakeDeleteResponse
    });
  });

  test("should return 404 when event deletion fails (deleteEvent returns false)", async () => {
    const fakeToken = "validtoken";
    const fakePayload = { id: 1 };
    jwt.verify.mockReturnValue(fakePayload);
    
    // I updated this to include rows for proper event checking
    const fakeEvent = { id: 400, event: "Event Not Deletable" };
    db.query.mockResolvedValueOnce({ rows: [fakeEvent] });
    
    User.deleteEvent.mockResolvedValueOnce(null);
    
    const response = await request(app)
      .delete("/events/1")
      .send({ token: fakeToken, eventId: 400 });
    
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(db.query).toHaveBeenCalledWith("SELECT * FROM events WHERE id = $1", [400]);
    expect(User.deleteEvent).toHaveBeenCalledWith(400, fakePayload.id);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Event not found" });
  });
});


describe("POST /events/:id/commentEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should add a comment and return 200 when successful", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    const fakeUserPayload = { id: 1 };
    jwt.verify.mockReturnValue(fakeUserPayload);

    const fakeEventId = 5;
    const fakeComment = "Nice event!";
    // Simulate a successful comment addition:
    // For example, Event.addComment returns an object with a rows property.
    const fakeCommentEvent = { rows: [{ commentId: 10, comment: fakeComment, userId: 1, eventId: fakeEventId }] };
    Event.addComment.mockResolvedValue(fakeCommentEvent);

    // Act: Send a POST request to /events/1/commentEvent.
    const response = await request(app)
      .post("/events/1/commentEvent")
      .send({
        token: fakeToken,
        eventId: fakeEventId,
        comment: fakeComment,
      });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Event.addComment).toHaveBeenCalledWith(fakeUserPayload.id, fakeEventId, fakeComment);
    expect(response.status).toBe(200);
    // The route extracts the rows before sending the response.
    expect(response.body).toEqual({ message: fakeCommentEvent.rows });
  });

  test("should return 404 with message 'Event not found' when adding a comment fails", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });
    
    // Simulate failure to add comment (i.e. the event was not found)
    Event.addComment.mockResolvedValue(null);

    // Act: Send a POST request with a non-existing eventId.
    const response = await request(app)
      .post("/events/1/commentEvent")
      .send({
        token: fakeToken,
        eventId: 999,
        comment: "Testing comment for missing event",
      });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Event.addComment).toHaveBeenCalledWith(1, 999, "Testing comment for missing event");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Event not found" });
  });
});