require('dotenv').config();

exports.config = {
    jwtSecretKey: process.env.JWT_SECRET_KEY,
    userDb: process.env.USER_DB,
    passDb: process.env.PASS_DB,
    adminPass: process.env.ADMIN_PASS
}