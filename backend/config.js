const BCRYPT_WORK_FACTOR = 12;
const SECRET_KEY = process.env.SECRET_KEY || "This-is-a-secret"

module.exports = {
    BCRYPT_WORK_FACTOR,
    SECRET_KEY
}