const request = require("supertest");
const express = require("express");
const authRouter = require("./auth"); 
const User = require("../models/user");
const LatLon = require("../models/latLon");
const db = require("../db")
const { createToken } = require("../helpers/tokens")

const {u1Token, u2Token, u3Token} = require("./_testCommon");

// We need to mock the createToken function so we have full control over its output.
// Jest provides a simple way to do that:
jest.mock("../helpers/tokens", () => ({
  createToken: jest.fn(),
}));

// This is to help mock the internal dependecies
jest.mock("../models/latLon");
jest.mock("../models/user");
jest.mock("../db");
jest.mock("../helpers/tokens");

// Create an Express app for testing that uses the auth router
const app = express();
app.use(express.json());
app.use("/auth", authRouter);


// To test a user login
describe("POST /auth/login", function (){

    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Should successfully get the correct information user logs in with correct credentials", async () => {
        
        const fakeUser = { username: "u1", userPassword: "u1Password", useraddress: "3210 Thornberry Circle Phenix City Alabama"};
        const fakeToken = "fake-jwt-token"

        User.authenticate = jest.fn().mockResolvedValue(fakeUser);

        createToken.mockReturnValue(fakeToken);

        const response = await request(app)
        .post("/auth/login")
        .send({
            loginUser: {
                username: "u1",
                userPassword: "u1Password",
            }
        })
        .expect("Content-Type", /json/)
        .expect(200);

        expect(User.authenticate).toHaveBeenCalledWith("u1", "u1Password");
        expect(response.body).toMatchObject({
            message: "login successful",
            user: fakeUser,
            token: fakeToken,
        });
    });

    test("Incorrect user information that should result in a fail", async () => {
        User.authenticate = jest.fn().mockResolvedValue(undefined);

        const response = await request(app)
        .post("/auth/login")
        .send({
            loginUser: {
                username: "wrongUsername",
                userPassword: "wrongPassword",
            },
        })
        .expect("Content-Type", /json/)
        .expect(200);

        expect(response.body).toEqual({
            message: "The username / password is incorrect",
        });

    });

});

describe("POST /auth/register", function (){

    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Show the message when the user object is empty", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({})

        expect(response.status).toBe(200);
        expect(response.body).toEqual({message: "Missing user data in request body"})
        
    });

    test('Shows the message in case a username is missing', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        user: {
          userPassword: "pass123",
          userAddress: "123 Main St"
        }
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Please enter a Username" });
    });

    test('Shows the message in case a password is missing', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        user: {
          username: "u1",
          userAddress: "123 Main St"
        }
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Please enter a Password" });
    });

    test('Shows message if address is invalid', async () => {
    LatLon.checkAddress.mockResolvedValue(null);
    
    const response = await request(app)
      .post('/auth/register')
      .send({
        user: {
          username: "u1",
          userPassword: "u1Password",
          userAddress: "Invalid Address"
        }
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Please enter a valid Address" });
    });

  test('Shows a conflict message if the username is already taken', async () => {
    LatLon.checkAddress.mockResolvedValue({ lat: 40.0, lon: -80.0 });
    User.register.mockResolvedValue(undefined);
    
    const response = await request(app)
      .post('/auth/register')
      .send({
        user: {
          username: "u1",
          userPassword: "u1Password",
          userAddress: "123 Main St"
        }
      });
    
    // The route returns a message indicating the conflict.
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "The username u1 has already been taken. Sorry try again!!"
    });
    });

    test('Register a successful user with valid data', async () => {
    const fakeCoordinates = { lat: 40.0, lon: -80.0 };
    const fakeUserRow = "(u1, fakeData)"; 
    const fakeRegisteredUser = { id: 1, username: "u1" };
    const fakeToken = "fake-jwt-token";

    // Configure mocks for a successful registration
    LatLon.checkAddress.mockResolvedValue(fakeCoordinates);
    User.register.mockResolvedValue({ row: fakeUserRow });
    db.query.mockResolvedValue({ rows: [fakeRegisteredUser] });
    createToken.mockReturnValue(fakeToken);

    const response = await request(app)
      .post('/auth/register')
      .send({
        user: {
          username: "u1",
          userPassword: "u1Password",
          userAddress: "123 Main St"
        }
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'User registered successfully',
      registeredUser: fakeRegisteredUser,
      token: fakeToken
    });
  });

});