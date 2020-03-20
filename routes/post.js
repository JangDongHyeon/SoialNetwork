const express = require('express');
const {
    getPosts,
    createPost,
    postById,
    updatePost,
    deletePost,
    postsById,
    photo,
    postLike,
    postunLike,
    comment,
    uncomment
} = require('../controllers/post');
const auth = require('../middleware/auth');
const {
    createPostValidatorRules,
    createPostValidator
} = require('../validator');
const passprot = require('passport')
const router = express.Router();


router.get('/posts/by/:userId', passprot.authenticate('jwt', {
    session: false
}), postsById);
router.get('/posts/', getPosts);
router.post('/post/new', passprot.authenticate('jwt', {
    session: false
}), createPost);


// comments

router.post('/post/comment/:postId', passprot.authenticate('jwt', {
    session: false
}), comment);
router.delete('/post/comment/:postId/:comment_id', passprot.authenticate('jwt', {
    session: false
}), uncomment);
//router.put('/post/updatecomment', auth, updateComment);


router.get('/post/:postId', postById);
router.delete('/post/:postId', passprot.authenticate('jwt', {
    session: false
}), deletePost);
router.put('/post/:postId', passprot.authenticate('jwt', {
    session: false
}), updatePost);

//photo
router.get('/post/photo/:postId', photo)

//like
router.put('/post/like/:postId', passprot.authenticate('jwt', {
    session: false
}), postLike);
router.put('/post/unlike/:postId', passprot.authenticate('jwt', {
    session: false
}), postunLike);

module.exports = router;