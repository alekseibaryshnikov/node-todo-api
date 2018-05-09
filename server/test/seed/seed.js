const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');
const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

// Seed data for todo's
const todos = [{
    _id: new ObjectID(),
    text: `This is seed item #1`
},
{
    _id: new ObjectID(),
    text: `This is seed item #2`
},
{
    _id: new ObjectID(),
    text: `This is seed item #3`
}
];

// Seed data for user's
const userFirstId = new ObjectID();
const userTwendId = new ObjectID();
const users = [{
    _id: userFirstId,
    email: 'test@test.ru',
    password: '123abc',
    tokens: [{
        access: 'auth',
        token: jwt.sign({
            _id: userFirstId,
            access: 'auth'
        }, 'abc123!').toString()
    }]
},
{
    _id: userTwendId,
    email: 'test2@test.ru',
    password: '123abc'
}
];

// Seed function for todo's
const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

// Seed function for user's
const populateUsers = (done) => {
    User.remove({}).then(() => {
        let userOne = new User(users[0]).save();
        let userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {
    populateTodos,
    populateUsers,
    todos,
    users
};