const mongoose = require('mongoose');
const {
    ObjectId
} = mongoose.Schema;
const {
    Schema
} = mongoose;

const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    photo: {
        data: Buffer,
        contenType: String
    },
    postedBy: {
        type: ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    likes: [{
        type: ObjectId,
        ref: 'User'
    }],
    comments: [{
        text: String,
        created: {
            type: Date,
            default: Date.now
        },
        name: {
            type: String
        },
        postedBy: {
            type: ObjectId,
            ref: 'User',

        }
    }]
});

module.exports = Post = mongoose.models.PostSchema || mongoose.model('Post', PostSchema);