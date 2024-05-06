const { config } = require("../config/secret");
const jwt = require('jsonwebtoken');


module.exports.isAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) {
        return res.status(404).json({ message: 'No User' });
    }
    jwt.verify(token, config.jwtSecretKey, (err, decoded) => {
        if (err) {
            console.log(err);
            res.status(401).json({ message: 'Unauthorized2' });
        } else {
            req.userId = decoded._id;
            next();
        }
    });
}

exports.genToken = (userId) => {
    return jwt.sign({ _id: userId }, config.jwtSecretKey, { expiresIn: '15 days' });
}