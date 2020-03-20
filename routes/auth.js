const express = require('express');
const {
    signup,
    signin,
    forgotPassword,
    resetPassword,
    socialLogin
} = require('../controllers/auth');
const {
    userById
} = require('../controllers/user');
const auth = require('../middleware/auth');
const {
    userSignupValidator,
    userSignupValidatorRules,
    userSigninValidatorRules,
    userSigninValidator,
    passwordResetValidatorRules,
    passwordResetValidator
} = require('../validator');
const router = express.Router();

router.post('/singup', userSignupValidatorRules(), userSignupValidator, signup);
router.post('/singin', userSigninValidatorRules(), userSigninValidator, signin);
router.post("/social-login", socialLogin);
router.put("/forgot-password", forgotPassword);
router.put("/reset-password", passwordResetValidatorRules(), passwordResetValidator, resetPassword);
// //singOut
// router.get('/singout', singout);

//any route
router.param('userId', userById);
module.exports = router;