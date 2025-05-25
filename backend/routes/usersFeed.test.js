const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = require("../routes/usersFeed"); // Adjust path if needed
const Post = require("../models/posts");
const LatLon = require("../models/latLon");
const { SECRET_KEY } = require("../config");

// Mock external modules
jest.mock("jsonwebtoken");
jest.mock("../models/posts");
jest.mock("../models/latLon");

let app;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/usersFeed", router);
});

describe("POST /usersFeed/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 200 and the full feed when all posts are retrieved successfully", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });

    // Simulate successful retrieval of all feed posts.
    const fakeFeed = { fullUrgentPost: [{ id: 500, title: "Urgent Alert", content: "Emergency!" }], posts: ["post1", "post2"] };
    Post.getAllFeedPosts.mockResolvedValue(fakeFeed);

    // Simulate successful retrieval of following posts.
    const fakeFollowingFeed = ["followingPost1", "followingPost2"];
    Post.getAllFollowingFeedPosts.mockResolvedValue(fakeFollowingFeed);

    // Act: Send a POST request to /usersFeed/1.
    const response = await request(app)
      .post("/usersFeed/1")
      .send({ token: fakeToken });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Post.getAllFeedPosts).toHaveBeenCalled();
    expect(Post.getAllFollowingFeedPosts).toHaveBeenCalledWith(1);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      feed: fakeFeed,
      followingFeed: fakeFollowingFeed,
      urgentPosts: fakeFeed.fullUrgentPost,
    });
  });

  test("should return 404 when no posts are found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });

    // Simulate failure of retrieving feed posts.
    Post.getAllFeedPosts.mockResolvedValue(null);

    // Act: Send a POST request with the token.
    const response = await request(app)
      .post("/usersFeed/1")
      .send({ token: fakeToken });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Post.getAllFeedPosts).toHaveBeenCalled();
    expect(response.status).toBe(404);
    expect(response.text).toBe("No posts found");
  });

  test("should return 404 when no following posts are found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });

    // Simulate successful retrieval of all feed posts.
    const fakeFeed = { fullUrgentPost: [{ id: 500, title: "Urgent Alert", content: "Emergency!" }], posts: ["post1", "post2"] };
    Post.getAllFeedPosts.mockResolvedValue(fakeFeed);

    // Simulate failure of retrieving following posts.
    Post.getAllFollowingFeedPosts.mockResolvedValue(null);

    // Act: Send a POST request.
    const response = await request(app)
      .post("/usersFeed/1")
      .send({ token: fakeToken });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(Post.getAllFollowingFeedPosts).toHaveBeenCalledWith(1);
    expect(response.status).toBe(404);
    expect(response.text).toBe("No following posts found");
  });
});


describe("POST /usersFeed/:id/event", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 200 and rounded event distance when event is found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });

    // Simulate successful event distance retrieval.
    const fakeEventDistance = {
      rows: [{ elements: [{ distance: { text: "5.7 miles" } }] }]
    };
    LatLon.getEventDistance.mockResolvedValue(fakeEventDistance);

    // Act: Send a POST request to /usersFeed/1/event.
    const response = await request(app)
      .post("/usersFeed/1/event")
      .send({ token: fakeToken, eventId: 100 });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(LatLon.getEventDistance).toHaveBeenCalledWith(1, 100);
    expect(response.status).toBe(200);
    expect(response.text).toBe("Event within 6 miles from your Address"); // Rounded value
  });

  test("should return 404 when no event is found", async () => {
    // Arrange:
    const fakeToken = "validtoken";
    jwt.verify.mockReturnValue({ id: 1 });

    // Simulate failure in retrieving event distance.
    LatLon.getEventDistance.mockResolvedValue(null);

    // Act: Send a POST request with the token and an invalid event ID.
    const response = await request(app)
      .post("/usersFeed/1/event")
      .send({ token: fakeToken, eventId: 999 });

    // Assert:
    expect(jwt.verify).toHaveBeenCalledWith(fakeToken, SECRET_KEY);
    expect(LatLon.getEventDistance).toHaveBeenCalledWith(1, 999);
    expect(response.status).toBe(404);
    expect(response.text).toBe("No event found");
  });
});

