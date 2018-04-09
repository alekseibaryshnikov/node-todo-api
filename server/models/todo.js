const mongoose = require('mongoose');

let Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    complited: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: String,
        default: null
    }
});

module.exports = {
    Todo
}