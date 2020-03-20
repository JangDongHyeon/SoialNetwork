const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    //Get Token from header
    const token = req.header('Authorization');

    //Check if not token
    if (!token) {
        return res.status(401).json({
            msg: 'No token, authorization denied'
        });
    }

    //Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({
            msg: 'Token is not valid'
        });
    }
};