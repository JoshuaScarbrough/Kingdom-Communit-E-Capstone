const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = require("../routes/follower_following"); // Adjust path if needed
const db = require("../db");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");

// Mock external modules
jest.mock("jsonwebtoken");
jest.mock("../db");
jest.mock("../models/user");

let app;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/follower_following", router);
});

describe("POST /follower_following/:id/followers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 200 and list all followers when user exists", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });

    // Simulate user retrieval from the database.
    const fakeUser = { id: 1, username: "testuser" };
    User.get.mockResolvedValue(fakeUser);

    // Simulate follower retrieval from the database.
    const fakeFollowers = [{ username: "follower1" }, { username: "follower2" }];
    db.query.mockResolvedValueOnce({ rows: fakeFollowers });

    // Act: Send a POST request to /follower_following/1/followers.
    const res = await request(app)
      .post("/follower_following/1/followers")
      .send({ token: fakeToken });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(User.get).toHaveBeenCalledWith(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: `List of all testuser's followers`,
      followers: fakeFollowers,
    });
  });

  test("should return 404 when user is not found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });

    // Simulate failure in retrieving the user.
    User.get.mockResolvedValue(null);

    // Act: Send a POST request with the token.
    const res = await request(app)
      .post("/follower_following/1/followers")
      .send({ token: fakeToken });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(User.get).toHaveBeenCalledWith(1);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "User not found" });
  });
});