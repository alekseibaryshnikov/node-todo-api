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

let newTodo = new Todo({
    text: 'Finish my work!',
    complited: false,
    createdAy: 123
});

newTodo.save().then(result => console.log(JSON.stringify(result, undefined, 2))).catch(e => console.error(`Unbale to save ${e}`));