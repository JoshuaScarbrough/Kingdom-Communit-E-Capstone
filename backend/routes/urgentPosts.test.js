const request = require('supertest');
const express = require('express');
const router = require('../routes/urgentPosts'); // Adjust path if necessary

// External dependencies used in the routes
const db = require('../db');
const jwt = require('jsonwebtoken');
const { createToken } = require('../helpers/tokens');
const User = require('../models/user');
const UrgentPost = require('../models/urgentPosts');
const LatLon = require('../models/latLon');
const { SECRET_KEY } = require("../config");

// Mock external modules
jest.mock('../db');
jest.mock('jsonwebtoken');
jest.mock('../helpers/tokens');
jest.mock('../models/user')
jest.mock('../models/urgentPosts');
jest.mock('../models/latLon');


let app;

beforeAll(() => {
  // Create a test Express app and mount the router.
  app = express();
  // Use express.json() middleware to parse JSON bodies.
  app.use(express.json());
  // Mount the router at a base path. Because the route is defined as router.post('/'),
  // we'll call our endpoint at '/users'.
  app.use('/urgentPosts', router);
});

describe("POST /urgentPosts/:id/specificUrgentPost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 200 and the full urgent post when an urgent post is found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1, username: "testuser" });

    // Simulate UrgentPost.getFullUrgentPost returning a valid post object.
    const fakeUrgentPost = { id: 123, title: "Emergency Alert", content: "Urgent details about an emergency." };
    UrgentPost.getFullUrgentPost.mockResolvedValue(fakeUrgentPost);

    // Act: Send a POST request to /urgentPosts/1/specificUrgentPost with token and urgentPostId.
    const response = await request(app)
      .post("/urgentPosts/1/specificUrgentPost")
      .send({ token: fakeToken, urgentPostId: 123 });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(UrgentPost.getFullUrgentPost).toHaveBeenCalledWith(123);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeUrgentPost);
  });

  test("should return 404 with an error message when no urgent post is found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 , username: "testuser" });

    // Simulate UrgentPost.getFullUrgentPost returning a falsey value.
    UrgentPost.getFullUrgentPost.mockResolvedValue(null);

    // Act: Send a POST request with an urgentPostId that does not exist.
    const response = await request(app)
      .post("/urgentPosts/1/specificUrgentPost")
      .send({ token: fakeToken, urgentPostId: 999 });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(UrgentPost.getFullUrgentPost).toHaveBeenCalledWith(999);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "No urgent post found" });
  });
});


describe("POST /urgentPosts/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create an urgent post successfully and return 201 with the post details", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1, username: "testuser" });

    // Simulate a successful urgent post creation.
    const newPost = { row: "(101,someData)" };
    User.createUrgentPost.mockResolvedValue(newPost);

    // Simulate a database query returning urgent post details.
    const fakeCurrentPost = {
      post: "Urgent Alert",
      imageURL: "http://example.com/urgent.jpg",
      userLocation: "Phenix City"
    };
    db.query.mockResolvedValue({ rows: [fakeCurrentPost] });

    // Act: Send a POST request to /urgentPosts/1.
    const response = await request(app)
      .post("/urgentPosts/1")
      .send({
        token: fakeToken,
        post: "Urgent Alert",
        imageUrl: "http://example.com/urgent.jpg",
        userLocation: "Phenix City"
      });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(User.createUrgentPost).toHaveBeenCalledWith("testuser", "Urgent Alert", "http://example.com/urgent.jpg", "Phenix City");
    expect(db.query).toHaveBeenCalledWith(
      "SELECT post, imageURL, userLocation FROM urgentPosts WHERE id = $1",
      ["101"]
    );
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Urgent Post created successfully",
      currentPost: fakeCurrentPost
    });
  });

  test("should return 404 if the urgent post is not created", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1, username: "testuser" });

    // Simulate failure in creating an urgent post.
    User.createUrgentPost.mockResolvedValue(null);

    // Act: Send a POST request with the required parameters.
    const response = await request(app)
      .post("/urgentPosts/1")
      .send({
        token: fakeToken,
        post: "Urgent Alert",
        imageUrl: "http://example.com/urgent.jpg",
        userLocation: "Phenix City"
      });

    // Assert:
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "No urgent post found" });
  });
});


describe("DELETE /urgentPosts/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should delete the urgent post successfully and return 200", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1, username: "testuser" });

    // Simulate the urgent post exists in the database.
    const fakePost = { id: 300, post: "Urgent Alert" };
    db.query.mockResolvedValueOnce({ rows: [fakePost] });

    // Simulate a successful deletion.
    const fakeDeleteResponse = { deleted: true };
    User.deleteUrgentPost.mockResolvedValueOnce(fakeDeleteResponse);

    // Act: Send a DELETE request with token and urgentPostId in the body.
    const res = await request(app)
      .delete("/urgentPosts/1")
      .send({ token: fakeToken, urgentPostId: 300 });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(db.query).toHaveBeenCalledWith("SELECT * FROM urgentPosts WHERE id = $1", [300]);
    expect(User.deleteUrgentPost).toHaveBeenCalledWith(300, 1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Urgent Post deleted Sucessfully",
      deletePost: fakeDeleteResponse
    });
  });

  test("should return 200 when urgent post is deleted", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1, username: "testuser" });

    // Simulate the case where the urgent post does not exist.
    db.query.mockResolvedValueOnce({ rows: [] });

    // Act: Send a DELETE request with a non-existent urgentPostId.
    const res = await request(app)
      .delete("/urgentPosts/1")
      .send({ token: fakeToken, urgentPostId: 999 });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(db.query).toHaveBeenCalledWith("SELECT * FROM urgentPosts WHERE id = $1", [999]);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "No urgent post found" });
  });
});

describe("POST /urgentPosts/:id/commentUrgentPost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should add a comment and return 200 when successful", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1, username: "testuser" });

    const fakeComment = "This is an important update.";
    const fakeUrgentPostId = 123;
    // Simulate a successful comment addition:
    const fakeCommentUrgentPost = { rows: [{ commentId: 500, userId: 1, urgentPostId: fakeUrgentPostId, content: fakeComment }] };
    UrgentPost.addComment.mockResolvedValue(fakeCommentUrgentPost);

    // Act: Send a POST request to /urgentPosts/1/commentUrgentPost.
    const response = await request(app)
      .post("/urgentPosts/1/commentUrgentPost")
      .send({
        token: fakeToken,
        urgentPostId: fakeUrgentPostId,
        comment: fakeComment
      });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(UrgentPost.addComment).toHaveBeenCalledWith(1, fakeUrgentPostId, fakeComment);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: fakeCommentUrgentPost.rows });
  });

  test("should return 404 when no urgent post is found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1, username: "testuser" });

    // Simulate failure to add comment (urgent post not found).
    UrgentPost.addComment.mockResolvedValue(null);

    // Act: Send a POST request with a non-existent urgentPostId.
    const response = await request(app)
      .post("/urgentPosts/1/commentUrgentPost")
      .send({
        token: fakeToken,
        urgentPostId: 999,
        comment: "Critical update for urgent post."
      });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(UrgentPost.addComment).toHaveBeenCalledWith(1, 999, "Critical update for urgent post.");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "No urgent post found" });
  });
});

