const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = require("../routes/likedEvents"); // Adjust path if needed
const db = require("../db");
const Event = require("../models/events");
const { SECRET_KEY } = require("../config");

// Mock external modules
jest.mock("jsonwebtoken");
jest.mock("../db");
jest.mock("../models/events");

let app;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/likedEvents", router);
});

jest.setTimeout(100000); // Increase timeout to 10 seconds


  test("should return 200 and all liked events when user exists", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });

    // Simulate user retrieval from the database.
    const fakeUser = { id: 1, username: "testuser" };
    db.query.mockResolvedValueOnce({ rows: [fakeUser] });

    // Simulate liked event IDs retrieval from the database.
    const fakeLikedEventIds = [{ id: 201 }, { id: 202 }];
    db.query.mockResolvedValueOnce({ rows: fakeLikedEventIds });

    // Simulate full event retrieval.
    const fakeFullEvents = [{ id: 201, name: "Concert" }, { id: 202, name: "Festival" }];
    Event.getFullEvent.mockImplementation(async (id) => fakeFullEvents.find((event) => event.id === id));

    // Act: Send a POST request to /likedEvents/1.
    const res = await request(app)
      .post("/likedEvents/1")
      .send({ token: fakeToken });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Event.getFullEvent).toHaveBeenCalledWith(201);
    expect(Event.getFullEvent).toHaveBeenCalledWith(202);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "All liked Events",
      posts: fakeFullEvents,
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
      .post("/likedEvents/1")
      .send({ token: fakeToken });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(db.query).toHaveBeenCalledWith("SELECT * FROM users WHERE id = $1", [1]);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "User not found" });
  });
