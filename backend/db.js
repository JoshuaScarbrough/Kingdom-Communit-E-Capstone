/**
 * I set up our database configuration here.
 * 
 * I did a few things to make testing work better:
 * 1. I made it not auto-connect during tests (was causing problems)
 * 2. I added some methods to control connections in our tests
 * 3. I separated the test database from our main one
 * 
 * This handles all our PostgreSQL connections.
 * I made it know whether we're testing or not.
 */

const { Client } = require("pg");

let DB_URI;

// I picked the right database based on what we're doing
// "postgresql://postgres:password@localhost:5432/capstone2"
if (process.env.NODE_ENV === "test"){
    DB_URI = "postgresql://postgres:password@localhost:5432/capstone2_test";
} else {
    DB_URI = "postgresql://postgres:password@localhost:5432/capstone2"
}

// I set up our database client
let db = new Client({
    connectionString: DB_URI
});

// I changed this to prevent connection leaks in tests
if (process.env.NODE_ENV !== "test") {
    db.connect();
}

// I added these to control database connections in tests
db.connectDb = async () => {
    await db.connect();
};

db.endDb = async () => {
    await db.end();
};

module.exports = db;