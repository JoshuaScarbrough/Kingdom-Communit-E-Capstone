const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test"){
    DB_URI = "postgresql://postgres:password@localhost:5432/capstone2_test";
} else {
    DB_URI = "postgresql://postgres:password@localhost:5432/capstone2"
}

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;