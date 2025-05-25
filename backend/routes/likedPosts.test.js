const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = require("../routes/likedPosts"); // Adjust path if needed
const db = require("../db");
const Post = require("../models/posts");
const { SECRET_KEY } = require("../config");

// Mock external modules
jest.mock("jsonwebtoken");
jest.mock("../db");
jest.mock("../models/posts");

let app;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/likedPosts", router);
});

jest.setTimeout(100000); // Increase timeout to 10 seconds

describe("POST /likedPosts/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 200 and all liked posts when user exists", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });

    // Simulate user retrieval from the database.
    const fakeUser = { id: 1, username: "testuser" };
    db.query.mockResolvedValueOnce({ rows: [fakeUser] });

    // Simulate liked post IDs retrieval from the database.
    const fakeLikedPostIds = [{ id: 101 }, { id: 102 }];
    db.query.mockResolvedValueOnce({ rows: fakeLikedPostIds });

    // Simulate full post retrieval.
    const fakeFullPosts = [{ id: 101, content: "First liked post" }, { id: 102, content: "Second liked post" }];
    Post.getFullPost.mockImplementation(async (id) => fakeFullPosts.find((post) => post.id === id));

    // Act: Send a POST request to /likedPosts/1.
    const response = await request(app)
      .post("/likedPosts/1")
      .send({ token: fakeToken });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Post.getFullPost).toHaveBeenCalledWith(101);
    expect(Post.getFullPost).toHaveBeenCalledWith(102);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "All liked Posts",
      posts: fakeFullPosts,
    });
  });

  test("should return 404 when user is not found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });

    // Simulate failure in retrieving the user.
    db.query.mockResolvedValueOnce({ rows: [] });

    // Act: Send a POST request with the token.
    const res = await request(app)
      .post("/likedPosts/1")
      .send({ token: fakeToken });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(db.query).toHaveBeenCalledWith("SELECT * FROM users WHERE id = $1", [1]);
    expect(res.status).toBe(404);
    expect(res.text).toBe("User not found");
  });
});

