const request = require('supertest');
const express = require('express');
const router = require('../routes/posts'); // Adjust path if necessary

// External dependencies used in the routes
const db = require('../db');
const jwt = require('jsonwebtoken');
const { createToken } = require('../helpers/tokens');
const User = require('../models/user');
const Post = require('../models/posts');
const { SECRET_KEY } = require("../config");

// Mock external modules
jest.mock('../db');
jest.mock('jsonwebtoken');
jest.mock('../helpers/tokens');
jest.mock('../models/user')
jest.mock('../models/posts');

let app;

beforeAll(() => {
  // Create a test Express app and mount the router.
  app = express();
  // Use express.json() middleware to parse JSON bodies.
  app.use(express.json());
  // Mount the router at a base path. Because the route is defined as router.post('/'),
  // we'll call our endpoint at '/users'.
  app.use('/posts', router);
});


describe("POST /posts/:id/specificPost", () => {
  beforeEach(() => {
    // Clear mocks before each test.
    jwt.verify.mockClear();
    Post.getFullPost.mockClear();
  });

  test("should return 400 if the post field is missing", async () => {
    // Arrange: Set up a fake token.
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ username: "testuser", id: 1 });
    
    // Act: Send a request without a "post" in the body.
    const response = await request(app)
      .post("/posts/1")
      .send({ token: fakeToken });
    
    // Assert: Expect a 400 status with the error message.
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Post is required" });
  });

  test("should return 400 if the post is not created", async () => {
    // Arrange: set up mocks.
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ username: "testuser", id: 1 });
    
    // Simulate no post created.
    User.createPost.mockResolvedValue(null);
    
    // Act: Send a request with a valid token and a defined post.
    const response = await request(app)
      .post("/posts/1")
      .send({ token: fakeToken, post: "This is a new post" });
    
    // Assert: Expect a 400 status with the corresponding error message.
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Post not created" });
  });

  test("should create a post successfully and return the current post data", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    // jwt.verify returns a valid payload.
    jwt.verify.mockReturnValue({ username: "testuser", id: 1 });
    
    // Simulate successful post creation.
    // newPost.row should be a string we can parse to extract the post ID.
    User.createPost.mockResolvedValue({ row: "(101,someData)" });
    
    // Simulate a database query to retrieve the full post data.
    const fakeCurrentPost = { post: "post content", imageURL: "http://example.com/image.jpg" };
    db.query.mockResolvedValueOnce({ rows: [fakeCurrentPost] });
    
    // Act: Send a request with valid token and post.
    const response = await request(app)
      .post("/posts/1")
      .send({ token: fakeToken, post: "This is a new post" });
    
    // Assert: Expect a 201 status and a body with the success message and current post data.
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Post created successfully",
      currentPost: fakeCurrentPost
    });
    
    // Also, check that User.createPost and db.query were called correctly.
    expect(User.createPost).toHaveBeenCalledWith("testuser", "This is a new post");
    // After extraction, "101" should be passed into the query.
    expect(db.query).toHaveBeenCalledWith(
      "SELECT post, imageURL FROM posts WHERE id = $1",
      ["101"]
    );
  });
});


describe("DELETE /posts/:id", () => {
  beforeEach(() => {
    // Clear mocks before each test.
    jest.clearAllMocks();
  });

  test("should delete the post successfully when found", async () => {
    // Arrange
    const fakeToken = "validtoken";
    const fakePayload = { id: 1, username: "testuser" };
    jwt.verify.mockReturnValue(fakePayload);

    // Simulate that the post exists by having db.query return a truthy value.
    const fakePostRecord = { id: 101, post: "content", imageURL: "someurl" };
    // This simulates the SELECT query returning a row.
    db.query.mockResolvedValueOnce({ rows: [fakePostRecord] });

    // Simulate successful deletion by User.deletePost.
    const fakeDeletedPost = { id: 101, status: "deleted" };
    User.deletePost.mockResolvedValueOnce(fakeDeletedPost);

    // Act: send a DELETE request with token and postId in the body.
    const response = await request(app)
      .delete("/posts/1")
      .send({
        token: fakeToken,
        postId: 101
      });

    // Assert:
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Post deleted Sucessfully",
      deletePost: fakeDeletedPost
    });
    // Verify that the db query to check the post exists was called correctly.
    expect(db.query).toHaveBeenCalledWith("SELECT * FROM posts WHERE id = $1", [101]);
    // Verify that User.deletePost was called with the correct postId and user id (from token).
    expect(User.deletePost).toHaveBeenCalledWith(101, fakePayload.id);
  });

  test("should return 404 if the post is not found", async () => {
    // Arrange
    const fakeToken = "validtoken";
    const fakePayload = { id: 1, username: "testuser" };
    jwt.verify.mockReturnValue(fakePayload);

    // Simulate no post existing by having db.query return a falsey value.
    db.query.mockResolvedValueOnce(null);

    // Act: send a DELETE request with a postId that doesn't exist.
    const response = await request(app)
      .delete("/posts/1")
      .send({
        token: fakeToken,
        postId: 999
      });

    // Assert:
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Post not found" });
  });
});


describe("POST /posts/:id/likePost", () => {
  beforeEach(() => {
    // Clear all previous mock calls before each test
    jest.clearAllMocks();
  });

  test("should return 200 and the likePost data when the post is successfully liked", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    // Ensure that jwt.verify returns a valid payload.
    jwt.verify.mockReturnValue({ id: 1 });
    
    // Simulate a successful call to Post.likePost.
    const fakeLikePost = { id: 101, liked: true, likeCount: 10 };
    Post.likePost.mockResolvedValue(fakeLikePost);
    
    // Act: Send a POST request to /auth/1/likePost with the token and postId in the body.
    const response = await request(app)
      .post("/posts/1/likePost")
      .send({ token: fakeToken, postId: 123 });
    
    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Post.likePost).toHaveBeenCalledWith(1, 123);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ likePost: fakeLikePost });
  });
  
  test("should return 404 when Post.likePost returns a falsey value", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });
    
    // Simulate that Post.likePost returns a falsey value (e.g. `null`)
    Post.likePost.mockResolvedValue(null);
    
    // Act: Send the POST request.
    const response = await request(app)
      .post("/posts/1/likePost")
      .send({ token: fakeToken, postId: 999 });
    
    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Post.likePost).toHaveBeenCalledWith(1, 999);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Post not found" });
  });
});


describe("DELETE /posts/:id/unlikePost", () => {
  beforeEach(() => {
    // Clear all mocks before each test execution.
    jest.clearAllMocks();
  });

  test("should return 200 and 'Post unliked' when the post exists and is unliked", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    // When verifying, return a sample payload with the user's id.
    jwt.verify.mockReturnValue({ id: 1 });
    
    // Simulate that the post exists:
    // Assuming db.query returns an object with a truthy value (e.g., an object with a rows array).
    db.query.mockResolvedValueOnce({ rows: [{ id: 123, post: "sample post" }] });
    
    // Simulate a successful unlike:
    Post.unlikePost.mockResolvedValueOnce(true);
    
    // Act:
    const response = await request(app)
      .delete("/posts/1/unlikePost")
      .send({ token: fakeToken, postId: 123 });
    
    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(db.query).toHaveBeenCalledWith("SELECT * FROM posts where id = $1", [123]);
    expect(Post.unlikePost).toHaveBeenCalledWith(1, 123);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Post unliked" });
  });

  test("should return 404 when no post is found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });
    
    // Simulate that the post is not found by having db.query return a falsey value.
    db.query.mockResolvedValueOnce(null);
    
    // Act:
    const response = await request(app)
      .delete("/posts/1/unlikePost")
      .send({ token: fakeToken, postId: 999 });
    
    // Assert:
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Post not found" });
  });
});


describe("POST /posts/:id/commentPost", () => {
  beforeEach(() => {
    // Clear all mocks before each test.
    jest.clearAllMocks();
  });

  test("should return 200 and comment added when comment is successfully added", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    // When verifying the token, simulate a valid user payload.
    jwt.verify.mockReturnValue({ id: 1 });
    
    // Simulate a successful comment addition by Post.addComment.
    const fakeComment = {
      commentId: 101,
      content: "nice post",
      userId: 1,
      postId: 123
    };
    Post.addComment.mockResolvedValue(fakeComment);

    // Act: Send a POST request with token, postId, and comment.
    const response = await request(app)
      .post("/posts/1/commentPost")
      .send({ token: fakeToken, postId: 123, comment: "nice post" });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Post.addComment).toHaveBeenCalledWith(1, 123, "nice post");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Comment added",
      commentPost: fakeComment
    });
  });

  test("should return 404 when Post.addComment returns a falsey value", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });
    
    // Simulate failure to add a comment (e.g., post not found).
    Post.addComment.mockResolvedValue(null);

    // Act: Send a POST request with token, postId, and comment.
    const response = await request(app)
      .post("/posts/1/commentPost")
      .send({ token: fakeToken, postId: 999, comment: "nice post" });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Post.addComment).toHaveBeenCalledWith(1, 999, "nice post");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Post not found" });
  });
});