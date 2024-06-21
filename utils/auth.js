const { config } = require("../config/secret");
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/UserModel');


module.exports.isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'No User' });
        return;
    }
    if (req.body.adminPass && req.body.adminPass === config.adminPass) {
        console.log('special request');
        req.special = true;
        // remove the adminPass from the request body
        // to make sure it wont interfere with the request
        req.body.adminPass = undefined;
    }
    const decodedToken = jwt.verify(token, config.jwtSecretKey);
    if (!decodedToken) {
        res.status(403).json({ message: 'Invalid token.' });
    }
    UserModel.findById(decodedToken._id)
        .then(user => {
            if (user.role.includes('Admin') || req.special) {
                req.userId = user._id;
                next();
            } else {
                res.status(403).json({ message: 'Access denied. You are not an admin.' });
            }
        })
        .catch(err => res.status(500).json({ err: "Server Error" }));
};

module.exports.isAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
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