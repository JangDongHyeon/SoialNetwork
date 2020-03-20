const express = require('express');
const {
    allUsers,
    getUser,
    updateUser,
    deleteUser,
    userById,
    getMe,
    proflieMe,
    userPhoto,
    addFollowing,
    addFollower,
    removeFollowing,
    removeFollower,
    findPeople
} = require('../controllers/user');
const passprot = require('passport')
const auth = require('../middleware/auth');
// const {
//     requireSignin
// } = require('../controllers/auth');

const router = express.Router();

router.get('/users', allUsers);
router.get('/user/me', passprot.authenticate('jwt', {
    session: false
}), getMe);
//find_people
router.get('/user/find_people', passprot.authenticate('jwt', {
    session: false
}), findPeople);

router.get('/profile/me', passprot.authenticate('jwt', {
    session: false
}), proflieMe)
router.get('/user/:user_id', userById);
router.put('/user/', passprot.authenticate('jwt', {
    session: false
}), updateUser);
router.delete('/user', passprot.authenticate('jwt', {
    session: false
}), deleteUser);

//follow
router.put('/user/follow/:id', passprot.authenticate('jwt', {
    session: false
}), addFollowing, addFollower);
router.put("/user/unfollow/:id", passprot.authenticate('jwt', {
    session: false
}), removeFollowing, removeFollower);

//photo
router.get('/user/photo/:user_id', userPhoto)



module.exports = router;