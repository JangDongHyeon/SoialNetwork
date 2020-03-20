const Post = require('../models/post');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');

exports.postById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate('postedBy', '_id name')
            .populate('likes', '_id').select('_id title body created comments likes')
        if (!req.params.postId.match(/^[0-9a-fA-F]{24}$/) || !post) {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }
        res.json(post);
    } catch (err) {
        console.log(err.message)
        return res.status(400).json({
            msg: 'server error'
        });
    }
};

exports.postsById = async (req, res) => {
    try {
        const posts = await Post.find({
                'postedBy': req.params.userId
            }).populate('postedBy', '_id name')
            .populate('likes', '_id')
            .select('_id title body created comments likes')
        if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/) || !posts) {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }
        res.json(posts);
    } catch (err) {
        console.log(err.message)
        return res.status(400).json({
            msg: 'server error'
        });
    }
};


exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('postedBy', '_id name')
            .select('_id title body created comments likes').sort({
                created: -1
            });
        res.json(
            posts
        );
    } catch (err) {
        console.log(err.message)
        return res.status(400).json({
            msg: 'server error'
        });
    }
};

exports.createPost = async (req, res, next) => {
    try {
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    msg: 'Image could not be uploaded'
                });
            }
            let post = await new Post(fields);
            post.postedBy = req.user.id;
            if (files.photo) {
                post.photo.data = fs.readFileSync(files.photo.path);
                post.photo.contentType = files.photo.type;
            }
            await post.save();
            res.json(post);
        });

    } catch (err) {
        console.log(err.message)
        res.status(400).json({
            msg: 'server error'
        });
    }
};

// exports.postsByUser = async (req, res) => {
//     try {
//         const posts = await Post.find({
//                 postedBy: req.profile._id
//             })
//             .populate('postedBy', '_id name')
//             .sort('_created');
//         res.json(posts);
//     } catch (err) {
//         return res.status(400).json({
//             error: err
//         });
//     }
// };

// exports.isPoster = (req, res, next) => {
//     let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;
//     if (!isPoster) {
//         return res.status(403).json({
//             error: 'User is not authorized'
//         });
//     }
//     next();
// };

exports.updatePost = async (req, res) => {
    try {

        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    msg: 'Photo could not be uploaded'
                });
            }
            let post = await Post.findById(req.params.postId).populate('postedBy', '_id name')
            // Check for ObjectId format and post
            if (!req.params.postId.match(/^[0-9a-fA-F]{24}$/) || !post) {
                return res.status(404).json({
                    msg: 'Post not found'
                });
            }

            //Check user
            if (post.postedBy._id.toString() !== req.user.id) {
                return res.status(401).json({
                    msg: 'User not authorized'
                });
            }

            post = _.extend(post, fields);
            post.updated = Date.now();

            if (files.photo) {
                post.photo.data = fs.readFileSync(files.photo.path);
                post.photo.contentType = files.photo.type;
            }

            await post.save();
            res.json(post);
        })
    } catch (err) {
        console.log(err.message)
        return res.status(400).json({
            msg: 'server error'
        });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        // Check for ObjectId format and post
        if (!req.params.postId.match(/^[0-9a-fA-F]{24}$/) || !post) {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }

        //Check user
        if (post.postedBy.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            });
        }
        await post.remove();
        res.json({
            msg: 'Post deleted successfully'
        });
    } catch (err) {
        console.log(err.message)
        return res.status(400).json({
            msg: 'server error'
        });
    }
};

exports.photo = async (req, res, next) => {
    const post = await Post.findById(req.params.postId);
    if (post.photo.data) {
        res.set('Content-Type', post.photo.contentType);
        return res.send(post.photo.data);
    } else {
        res.json('err')
    }
};

//like
exports.postLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
        //Check if the post has aleady been likend
        if (post.likes.filter(like => like.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: 'Post already liked'
            });
        }

        post.likes.unshift(
            req.user.id
        );


        await post.save();
        res.json({
            '_id': req.user.id
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

}

exports.postunLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        //Check if the post has aleady been likend
        if (post.likes.filter(like => like.toString() === req.user.id).length === 0) {
            return res.status(400).json({
                msg: 'Post has not yet been liked'
            });
        }
        const removeIndex = post.likes.map(like => like.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json({
            '_id': req.user.id
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

exports.comment = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.postId);
        console.log(req.body);
        console.log(req.body.text);

        const newComment = {
            text: req.body.text,
            name: user.name,
            postedBy: req.user.id
        }

        post.comments.unshift(newComment);

        await post.save();

        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}


exports.uncomment = async (req, res) => {
    try {

        const post = await Post.findById(req.params.postId);

        const comment = post.comments.find(comment => comment._id.toString() === req.params.comment_id)

        if (!comment) {
            return res.status(400).json({
                msg: 'Comment does not exist'
            });
        }

        //Check User
        if (comment.postedBy.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            });
        }

        //Get remove index
        const removeIndex = post.comments.map(comment => comment._id).indexOf(req.params.comment_id);

        post.comments.splice(removeIndex, 1);

        await post.save();

        res.json(post.comments);



    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}