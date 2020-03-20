const { check, validationResult } = require('express-validator');

//Create Post
exports.createPostValidatorRules = () => {
    return [
        check('title', 'Write a title')
            .not()
            .isEmpty(),
        check('title', 'Title must be between 4 to 150 characters').isLength({
            min: 4,
            max: 150
        }),
        // body
        check('body', 'Write a body')
            .not()
            .isEmpty(),
        check('body', 'Body must be between 4 to 2000 characters').isLength({
            min: 4,
            max: 2000
        })
    ];
};

exports.createPostValidator = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    // const extractedErrors = []
    // errors.array().map(err => extractedErrors.push({
    //     [err.param]: err.msg
    // }))

    // return res.status(422).json({
    //     errors: extractedErrors,
    // })
    return res.status(400).json({
        errors: errors.array()
    });
};
//SignUP
exports.userSignupValidatorRules = () => {
    return [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('email', 'Email must be between 3 to 32 characters')
            .matches(/.+\@.+\..+/)
            .withMessage('Email must contain @')
            .isLength({
                min: 4,
                max: 2000
            }),
        check('password', 'Password is required')
            .not()
            .isEmpty(),
        check('password')
            .isLength({
                min: 6
            })
            .withMessage('Password must contain at least 6 characters')
            .matches(/\d/)
            .withMessage('Password must contain a number')
    ];
};

exports.userSignupValidator = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(400).json({
        errors: errors.array()
    });
};

//SignIN
exports.userSigninValidatorRules = () => {
    return [
        check('email', 'Plesase include a valid email').isEmail(),
        check('password', 'password is requried')
            .not()
            .isEmpty()
    ];
};

exports.userSigninValidator = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(400).json({
        errors: errors.array()
    });
};

//Comment
exports.commentValidatorRules = () => {
    return [
        check('text', 'Text is required')
            .not()
            .isEmpty()
    ];
};

exports.commentValidator = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(400).json({
        errors: errors.array()
    });
};

//Comment
exports.passwordResetValidatorRules = () => {
    return [
        check('newPassword', 'Password is required')
            .not()
            .isEmpty(),
        check('newPassword')
            .isLength({
                min: 6
            })
            .withMessage('Password must be at least 6 chars long')
            .matches(/\d/)
            .withMessage('must contain a number')
            .withMessage('Password must contain a number')
    ];
};

exports.passwordResetValidator = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({
        msg: firstError
    });
};
