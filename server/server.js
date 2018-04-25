
require('./../config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const {
    mongoose
} = require('./db/mongoose');
const {
    Todo
} = require('./models/todo');
const {
    User
} = require('./models/user');

const app = new express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    });

    todo.save()
        .then(doc => res.send(doc))
        .catch(e => res.status(400).send(e));
});

app.get('/todos', (req, res) => {
    Todo.find()
        .then((todos) => {
            res.status(200).send({
                todos
            });
        })
        .catch(e => res.status(400).send(e));
});

app.get('/todos/:id', (req, res) => {
    const _id = req.params.id;

    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }

    Todo.findOne({ _id })
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }

            res.status(200).send({ todo });
        })
        .catch(e => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
    const _id = req.params.id;

    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(_id)
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }

            res.status(200).send({ todo });
        })
        .catch(e => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({ todo });
    }).catch((e) => {
        res.status(400).send();
    })
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {
    app
};