const mongoose = require('mongoose');
const {
    ObjectId
} = mongoose.Schema;
const {
    v1
} = require('uuid');
const crypto = require('crypto');
const {
    Schema
} = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    about: {
        type: String,
        trim: true
    },
    following: [{
        type: ObjectId,
        ref: "User"
    }],
    followers: [{
        type: ObjectId,
        ref: "User"
    }],
    resetPasswordLink: {
        data: String,
        default: ""
    },
    type: {
        type: String,
        default: 'local'
    },
    updated: Date
});

module.exports = User = mongoose.models.UserSchema || mongoose.model('User', UserSchema);