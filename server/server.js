require('./../config/config.js');

const _ = require('lodash');
const Express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = new Express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    const todo = new Todo({
        text: req.body.text,
        _created: req.user._id
    });

    todo.save()
        .then(doc => res.send(doc))
        .catch(e => res.status(400).send(e));
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _created: req.user._id
    })
        .then((todos) => {
            res.status(200).send({
                todos,
            });
        })
        .catch(e => res.status(400).send(e));
});

app.get('/todos/:id', authenticate, (req, res) => {
    const _id = req.params.id;

    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }

    Todo.findOne({
        _id,
        _created: req.user._id
    })
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            
            res.status(200).send({
                todo,
            });
        })
        .catch(e => res.status(400).send());
});

app.delete('/todos/:id', authenticate, (req, res) => {
    const _id = req.params.id;

    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }

    Todo.findOneAndRemove({
        _id,
        _created: req.user._id
    })
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }

            res.status(200).send({
                todo,
            });
        })
        .catch(e => res.status(400).send());
});

app.patch('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id: id,
        _created: req.user._id
    }, {
        $set: body,
    }, {
            new: true,
        }).then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }

            res.send({
                todo,
            });
        }).catch((e) => {
            res.status(400).send();
        });
});

app.post('/users', (req, res) => {
    const body = _.pick(req.body, [
        'email',
        'password',
        'name',
        'age',
        'location',
    ]);
    const user = new User(body);
    user.save()
        .then(() => user.generateAuthToken())
        .then(token => res.header('x-auth', token).send(user.toJSON()))
        .catch(err => res.status(400).send(err));
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password)
        .then((user) => user.generateAuthToken()
            .then((token) => {
                res.set('x-auth', token).status(200).send(token);
            }))
        .catch(e => res.status(400).send());
});

app.delete('/users/me/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token)
        .then(() => {
            res.status(200).send();
        })
        .catch(() => {
            res.status(400).send();
        });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {
    app,
};
