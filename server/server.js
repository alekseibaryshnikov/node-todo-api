const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

let Todo = mongoose.model('Todo', {
    text: {
        type: String
    },
    complited: {
        type: Boolean
    },
    createdAy: {
        type: Number
    }
});

let Users = mongoose.model('Users', {
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
    }
});

// let newTodo = new Todo({
//     text: 'Finish my work!',
//     complited: false,
//     createdAy: 123
// });

let newUser = new Users({
    email: ' a250188@yandex.ru '
});

newUser.save().then(result => console.log(JSON.stringify(result, undefined, 2))).catch(e => console.error(`Unbale to save ${e}`));