const request = require('supertest');
const express = require('express');
const router = require('../routes/users'); // Adjust path if necessary

// External dependencies used in the routes
const db = require('../db');
const jwt = require('jsonwebtoken');
const { createToken } = require('../helpers/tokens');
const User = require('../models/user');

// Mock external modules
jest.mock('../db');
jest.mock('jsonwebtoken');
jest.mock('../helpers/tokens');
jest.mock('../models/user');

let app;

beforeAll(() => {
  // Create a test Express app and mount the router.
  app = express();
  // Use express.json() middleware to parse JSON bodies.
  app.use(express.json());
  // Mount the router at a base path. Because the route is defined as router.post('/'),
  // we'll call our endpoint at '/users'.
  app.use("/users", router);
});


describe("POST /users, This is to get a user based upon a given Id", () => {

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        db.query.mockClear();
    });

  test("should return the user data when a user is found", async () => {
    // Arrange: simulate a successful database query returning one user
    const fakeUserData = [{ id: 1, username: "testuser", userAddress: "123 Main st" }];
    db.query.mockResolvedValueOnce({ rows: fakeUserData });
    
    // Act: send a POST request containing an id.
    const response = await request(app)
      .post("/users")
      .send({ id: 1 });
    
    // Assert: Expect a 200 status and that the response body equals the fake data.
    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeUserData);
  });

  test("should return a 400 status and error message if no user is found", async () => {
    // Arrange: simulate a db query that returns an object with rows as undefined.
    // This triggers the !user condition in the route.
    db.query.mockResolvedValueOnce({ rows: undefined });
    
    // Act: send a POST request with an id that does not correspond to a user.
    const response = await request(app)
      .post("/users")
      .send({ id: 999 });
    
    // Assert: Expect a 400 status and the error message.
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "There is no user" });
  });
});


describe("POST /users/:id/homepage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return homepage data for a valid token and existing user", async () => {
    // Arrange: set up a fake token and expected return data.
    const fakeToken = "validtoken";
    // Simulate token payload containing the user id.
    jwt.verify.mockReturnValue({ id: 1, username: "testuser" });
    
    // Simulate User.get returning a valid user.
    const fakeUser = {
      id: 1,
      username: "testuser",
      bio: "This is their bio",
      profilepictureurl: "http://example.com/pic.jpg",
      coverphotourl: "http://example.com/cover.jpg"
    };
    User.get.mockResolvedValue(fakeUser);
    
    // Simulate User.getAllPosts returning posts, events, and urgentPosts.
    const fakeAllPosts = {
      posts: ["post1", "post2"],
      events: ["event1"],
      urgentPosts: ["urgent1"]
    };
    User.getAllPosts.mockResolvedValue(fakeAllPosts);
    
    // Act: send a POST request to /auth/1/homepage with the fake token.
    const response = await request(app)
      .post("/users/1/homepage")
      .send({ token: fakeToken });
    
    // Assert: Expect 200 with the correctly structured data.
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: {
        username: fakeUser.username,
        bio: fakeUser.bio,
        profilePic: fakeUser.profilepictureurl,
        coverPhoto: fakeUser.coverphotourl
      },
      allPosts: {
        posts: fakeAllPosts.posts,
        events: fakeAllPosts.events,
        urgentPosts: fakeAllPosts.urgentPosts
      }
    });
  });

  test("should return 404 if user is not found", async () => {
    // Arrange: set up fake token with a valid payload but simulate missing user.
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 2 });
    
    // Simulate User.get returning a falsey value.
    User.get.mockResolvedValue(null);
    
    // Act: perform the request.
    const res = await request(app)
      .post("/users/2/homepage")
      .send({ token: fakeToken });
    
    // Assert: Expect a 404 status and an error message.
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Could not find user" });
  });
});


describe("PATCH /users/:id/update", () => {
  beforeEach(() => {
    // Clear previous mocks before each test.
    jwt.verify.mockClear();
    db.query.mockClear();
    createToken.mockClear();
  });

  test("should update user info and return a new token when provided valid token and update data", async () => {
    // Arrange
    const fakeToken = "validtoken";
    // When verifying the token, return a payload with username and id.
    jwt.verify.mockReturnValue({ username: "testuser", id: 1 });

    // First: simulate fetching the current user.
    const currentUser = {
      id: 1,
      username: "testuser",
      bio: "old bio",
      useraddress: "old address"
    };
    // This query call should return our currentUser in an array.
    db.query.mockResolvedValueOnce({ rows: [currentUser] });

    // We send "updatedUser" as part of the request body.
    const updatedUserData = {
      username: "newtestuser",
      bio: "updated bio",
      address: "new address"
    };
    // Next: simulate updating the user.
    const updatedUser = {
      username: "newtestuser",
      bio: "updated bio",
      useraddress: "new address"
    };
    db.query.mockResolvedValueOnce({ rows: [updatedUser] });

    // Next: simulate querying for new token data.
    const tokenUserData = { id: 1, username: "newtestuser" };
    db.query.mockResolvedValueOnce({ rows: [tokenUserData] });

    // Finally, simulate createToken returning a new token.
    createToken.mockReturnValue("new-token-string");

    // Act: send the PATCH request.
    const response = await request(app)
      .patch("/users/1/update")
      .send({
        token: fakeToken,
        updatedUser: updatedUserData
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: `User ${updatedUser.username} has been updated!`,
      user: updatedUser,
      token: "new-token-string"
    });

    // Ensure that jwt.verify was called with the correct token and any secret string.
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, expect.any(String));
    });

    test("should return a 404 when no user is found", async () => {
    // Arrange
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ username: "nonexistent", id: 2 });

    // Simulate the query to fetch current user returning no rows.
    db.query.mockResolvedValueOnce({ rows: [] });

    // Act: send the PATCH request.
    const res = await request(app)
      .patch("/users/2/update")
      .send({
        token: fakeToken,
        updatedUser: {
          username: "irrelevant",
          bio: "irrelevant",
          address: "irrelevant"
        }
      });

    // Assert
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Could not find user" });
  });
});


describe("PATCH /users/:id/updatePhotos", () => {
  beforeEach(() => {
    // Clear any previous mock calls.
    jwt.verify.mockClear();
    db.query.mockClear();
    createToken.mockClear();
  });

  test("should update user's photos and return a new token when provided valid token and update data", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    // Simulate token verification returning a payload.
    jwt.verify.mockReturnValue({ username: "testuser", id: 1 });
    
    // First query: select the existing user.
    const currentUser = {
      username: "testuser",
      profilepictureurl: "oldProfilePic",
      coverphotourl: "oldCoverPhoto"
    };
    db.query.mockResolvedValueOnce({ rows: [currentUser] });
    
    // The request body contains an updatedUser field with new photos.
    const updatedPhotos = {
      profilePicture: "newProfilePic",
      coverPhoto: "newCoverPhoto"
    };
    const updateReqBody = {
      token: fakeToken,
      updatedUser: updatedPhotos
    };
    
    // Second query: simulate the UPDATE query returning the updated user.
    const updatedUser = {
      profilepictureurl: updatedPhotos.profilePicture,
      coverphotourl: updatedPhotos.coverPhoto
    };
    db.query.mockResolvedValueOnce({ rows: [updatedUser] });
    
    // Third query: simulate retrieving data for generating a new token.
    const tokenUserData = { id: 1, username: "testuser" };
    db.query.mockResolvedValueOnce({ rows: [tokenUserData] });
    
    // Simulate createToken returning a new token string.
    createToken.mockReturnValue("new-token-string");

    // Act: send the PATCH request.
    const response = await request(app)
      .patch("/users/1/updatePhotos")
      .send(updateReqBody);
    
    // Assert: expect a 200 response with the correct JSON structure.
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Users pictures have been updated!",
      user: updatedUser,
      token: "new-token-string"
    });
    
    // Also, ensure that jwt.verify was called correctly.
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, expect.any(String));
  });

  test("should return 404 if no user is found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ username: "nonexistent", id: 2 });
    // Simulate the select query returning an empty array so that the user is not found.
    db.query.mockResolvedValueOnce({ rows: [] });
    
    // Act: send the PATCH request.
    const response = await request(app)
      .patch("/users/2/updatePhotos")
      .send({ token: fakeToken, updatedUser: { profilePicture: "new", coverPhoto: "new" } });
      
    // Assert: expect a 404 response with an error message.
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Could not find user" });
  });
});