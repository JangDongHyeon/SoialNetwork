const _ = require('lodash');
const brcypt = require('bcryptjs');
const formidable = require('formidable');
const fs = require('fs');
const User = require('../models/user');

exports.userById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.user_id).populate('following', '_id name').populate('followers', '_id name')
        if (!user) return res.status(400).json({
            msg: 'User not found'
        });

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({
                msg: 'Profile not found'
            });
        }
        return res.status(400).json({
            msg: 'server error'
        });
    }
}

exports.userPhoto = async (req, res, next) => {
    const user = await User.findById(req.params.user_id);
    if (user.photo.data) {
        res.set(('Content-Type', user.photo.contentType));
        return res.send(user.photo.data);
    } else {
        res.json('err')
    }
};

exports.hasAuthorization = (req, res, next) => {
    let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;

    const authorized = sameUser;

    // console.log("req.profile ", req.profile, " req.auth ", req.auth);
    // console.log("SAMEUSER", sameUser, "ADMINUSER", adminUser);

    if (!authorized) {
        return res.status(403).json({
            msg: 'User is not authorized to perform this action'
        });
    }
    next();
};
exports.addFollowing = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        if (user.following.filter(foll => foll.toString() === req.params.id).length > 0) {
            return res.status(400).json({
                msg: 'User already following'
            });
        }

        user.following.unshift(
            req.params.id
        );

        await user.save();
        next();
        // res.json(user.following);
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({
            msg: 'server error'
        });
    }
}

exports.addFollower = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (user.followers.filter(foll => foll.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: 'User already followers'
            });
        }

        user.followers.unshift(
            req.user.id
        );
        await user.save();
        const mainUser = await User.findById(req.params.id).populate('following', '_id name').populate('followers', '_id name')
        mainUser.password = undefined;
        console.log(mainUser);
        res.json(mainUser);
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({
            msg: 'server error'
        });
    }
}

exports.removeFollowing = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)

        if (user.following.filter(foll => foll.toString() === req.params.id).length === 0) {
            return res.status(400).json({
                msg: 'User has not yet been unfollowing'
            });
        }
        const removeIndex = user.following.map(foll => foll.toString()).indexOf(req.params.id);

        user.following.splice(removeIndex, 1);

        await user.save();

        next();
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({
            msg: 'server error'
        });
    }
    // res.json(user.following);
}

exports.removeFollower = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)

        if (user.followers.filter(foll => foll.toString() === req.user.id).length === 0) {
            return res.status(400).json({
                msg: 'User has not yet been unfollowers'
            });
        }
        const removeIndex = user.followers.map(foll => foll.toString()).indexOf(req.user.id);

        user.followers.splice(removeIndex, 1);

        await user.save();
        res.json(req.user.id);
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({
            msg: 'server error'
        });
    }
    // res.json(user.followers);
}



exports.allUsers = async (req, res) => {
    try {
        const user = await User.find();
        res.json({
            profiles: user
        });
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({
            msg: 'server error'
        });
    }
};

exports.getUser = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('following', '_id name').populate('followers', '_id name').select('-password');
        res.json(user);
    } catch (error) {
        console.error(err.message);
        return res.status(400).json({
            msg: 'server error'
        });
    }
};

exports.proflieMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('following', '_id name').populate('followers', '_id name');
        res.json(
            user
        );
    } catch (error) {
        console.error(err.message);
        return res.status(400).json({
            msg: 'server error'
        });
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        let form = new formidable.IncomingForm();
        // console.log("incoming form data: ", form);
        form.keepExtensions = true;

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    msg: 'Photo could not be uploaded'
                });
            }

            let user = await User.findById(req.user.id).populate('following', '_id name').populate('followers', '_id name');
            if (!user) {
                res.status(400).json({

                    msg: 'Invalid Credntials'

                });
            }

            // const isMatch = await brcypt.compare(fields.password, user.password);
            // if (isMatch) {
            //     res.status(400).json({
            //         msg: 'password sam'
            //     });
            // }

            user = _.extend(user, fields);
            user.updated = Date.now();
            const salt = await brcypt.genSalt(10);
            user.password = await brcypt.hash(fields.password, salt);

            if (files.photo) {
                user.photo.data = fs.readFileSync(files.photo.path);
                user.photo.contentType = files.photo.type;
            }

            await user.save();
            user.password = undefined;
            res.json(
                user
            );

        })




    } catch (err) {
        console.error(err.message);
        res.status(400).json({
            msg: 'server error'
        });
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        await Post.deleteMany({
            postedBy: req.user.id
        });
        console.log(req.user.id);
        await User.findOneAndDelete({
            '_id': req.user.id
        });

        res.json({
            msg: 'User deleted successfully'
        });
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({
            msg: 'server error'
        });
    }
};

exports.findPeople = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('following', '_id').populate('followers', '_id');

        if (!user) return res.status(400).json({
            msg: 'User not found'
        });
        let following = user.following;

        following.push(req.user.id);
        const users = await User.find({
            _id: {
                $nin: following
            }
        }).select('-password');

        res.json({
            profiles: users
        });
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({
            msg: 'server error'
        });
    }
};