const { config } = require("../config/secret");
const jwt = require('jsonwebtoken');

exports.genToken = (userId) => {
    return jwt.sign({ _id: userId }, config.jwtSecretKey, { expiresIn: '15 days' });
}