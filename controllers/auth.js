const jwt = require('jsonwebtoken');
const brcypt = require('bcryptjs');
const {
    sendEmail
} = require("../helpers");
const _ = require('lodash');
require('dotenv').config();
var expressJwt = require('express-jwt');
const User = require('../models/user');

exports.signup = async (req, res) => {
    const {
        name,
        email,
        password
    } = req.body;
    try {
        let user = await User.findOne({
            email
        }).populate('following', '_id name').populate('followers', '_id name');
        if (user) {
            res.status(400).json({
                errors: [{
                    msg: 'User already exists'
                }]
            });
        }

        user = new User({
            name,
            email,
            password
        });

        const salt = await brcypt.genSalt(10);

        user.password = await brcypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };
        user.password = undefined;
        jwt.sign(
            payload,
            process.env.JWT_SECRET, {
                expiresIn: 360000
            },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token: "Bearer " + token,
                    user
                });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            'msg': 'Server error'
        });
    }
};

exports.signin = async (req, res) => {
    const {
        email,
        password
    } = req.body;
    try {
        let user = await User.findOne({
            email
        }).populate('following', '_id name').populate('followers', '_id name');

        if (!user) {
            res.status(400).json({
                errors: [{
                    msg: 'Invalid Credntials'
                }]
            });
        }

        const isMatch = await brcypt.compare(password, user.password);

        if (!isMatch) {
            res.status(400).json({
                errors: [{
                    msg: 'Invalid Credntials'
                }]
            });
        }

        const payload = {
            user: {
                id: user.id
            }
        };
        user.password = undefined;
        jwt.sign(
            payload,
            process.env.JWT_SECRET, {
                expiresIn: 360000
            },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token: "Bearer " + token,
                    user
                });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            'msg': 'Server error'
        });
    }
};


exports.socialLogin = async (req, res) => {
    try {


        let user = await User.findOne({
            email: req.body.email
        });

        if (!user) {
            const newUser = new User(req.body);
            newUser.type = 'social';
            await newUser.save();

            const payload = {
                user: {
                    id: newUser.id
                },
                iss: "NODEAPI"
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET, {
                    expiresIn: 360000
                },
                (err, token) => {
                    if (err) throw err;
                    return res.json({
                        token: "Bearer " + token,
                        newUser
                    });
                }
            );
        } else {
            user = await _.extend(user, req.body);
            user.updated = Date.now();
            await user.save();
            const payload = {
                user: {
                    id: user.id
                },
                iss: "NODEAPI"
            };
            jwt.sign(
                payload,
                process.env.JWT_SECRET, {
                    expiresIn: 360000
                },
                (err, token) => {
                    if (err) throw err;
                    return res.json({
                        token: "Bearer " + token,
                        user
                    });
                }
            );
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            'msg': 'Server error'
        });
    }
}

// exports.singout = (req, res) => {
//     res.clearCookie('t');
//     return res.json({
//         message: 'Signout success!'
//     });
// };

// exports.requireSignin = expressJwt({
//     secret: process.env.JWT_SECRET,
//     userProperty: 'auth'
// });

exports.forgotPassword = async (req, res) => {
    try {


        if (!req.body) return res.status(400).json({
            msg: "No request body"
        });
        if (!req.body.email)
            return res.status(400).json({
                msg: "No Email in request body"
            });

        console.log("forgot password finding user with that email");
        const {
            email
        } = req.body;
        console.log("signin req.body", email);

        const user = await User.findOne({
            email: email,
            type: 'local'
        });

        if (!user)
            return res.status("401").json({
                msg: "User with that email does not exist!"
            });
        const token = jwt.sign({
                _id: user._id,
                iss: "NODEAPI"
            },
            process.env.JWT_SECRET
        );

        const emailData = {
            from: "noreply@node-react.com",
            to: email,
            subject: "Password Reset Instructions",
            text: `Please use the following link to reset your password: ${
                process.env.CLIENT_URL
            }/reset-password/${token}`,
            html: `<p>Please use the following link to reset your password:</p> <p>${
                process.env.CLIENT_URL
            }/reset-password/${token}</p>`
        };
        // await User.updateOne({
        //     email: email
        // }, {
        //     $set: {
        //         resetPasswordLink: token
        //     }
        // })
        await user.updateOne({
            resetPasswordLink: token
        });


        sendEmail(emailData);
        res.status(200).json({
            msg: `Email has been sent to ${email}. Follow the instructions to reset your password.`
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            'msg': 'Server error'
        });
    }
}


exports.resetPassword = async (req, res) => {
    try {


        const {
            resetPasswordLink,
            newPassword
        } = req.body;


        const user = await User.findOne({
            resetPasswordLink
        });
        console.log(user);
        if (!user)
            return res.status("401").json({
                msg: "Invalid Link!"
            });






        const salt = await brcypt.genSalt(10);
        user.password = await brcypt.hash(newPassword, salt);
        user.resetPasswordLink = ''
        // await User.updateOne({
        //     resetPasswordLink: resetPasswordLink
        // }, {
        //     $set: {
        //         resetPasswordLink: undefined,
        //         password: password,
        //         updated: Date.now()
        //     }
        // })
        // const updatedFields = {
        //     password: password,
        //     resetPasswordLink: ''
        // };

        // user = _.extend(user, updatedFields);
        user.updated = Date.now();
        await user.save();


        res.status(200).json({
            msg: `Great! Now you can login with your new password.`
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            'msg': 'Server error'
        });
    }
}