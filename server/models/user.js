const mongoose = require('mongoose');

let User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    name: {
        type: String,
        trim: true,
        default: null
    },
    age: {
        type: Number,
        default: null
    },
    location: {
        type: String,
        default: null
    }
});

module.exports = {
    User
};