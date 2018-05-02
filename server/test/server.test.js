const expect = require('expect');
const request = require('supertest');
const {
    ObjectID
} = require('mongodb');
const {
    populateTodos,
    populateUsers,
    todos,
    users
} = require('./seed/seed');
const {
    User
} = require('./../models/user');
const {
    Todo
} = require('./../models/todo');
const {
    app
} = require('./../server');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
    it('should take less than 500ms', function (done) {
        this.timeout(500);
        setTimeout(done, 300);
    });

    it('should create a new todo', (done) => {
        let text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(seed.length + 1);
                    expect(todos[seed.length].text).toBe(text);
                    done();
                }).catch(e => done(e));
            })
    });

    it('should not create todo with invalid data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(seed.length);
                    done();
                }).catch(e => done(e));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos from database', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(seed.length);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return doc', (done) => {
        request(app)
            .get(`/todos/${seed[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(seed[0].text);
            })
            .end(done);
    });

    it('should return 404 if _id is invalid', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        const fakeId = new ObjectID();
        request(app)
            .get(`/todos/${fakeId.toHexString()}`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should delete todo', (done) => {
        let hexId = seed[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId)
                    .then((todo) => {
                        expect(todo).toBeFalsy();
                        done();
                    }).catch(e => done(e));
            });
    });

    it('should return 404 if _id is invalid', (done) => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        const fakeId = new ObjectID();
        request(app)
            .delete(`/todos/${fakeId.toHexString()}`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update todo', (done) => {
        let hexId = seed[0]._id.toHexString();
        let newText = 'New text for testing the PATCH method.';
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                text: newText,
                completed: true,
                completedAt: new Date()
            })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId)
                    .then((todo) => {
                        expect(todo.text).toBe(newText);
                        expect(todo.completed).toBeTruthy();
                        done();
                    }).catch(e => done(e));
            });
    });

    it('should clear completedAt when todo is not completed', (done) => {
        let hexId = seed[0]._id.toHexString();
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                completed: false,
                completedAt: null
            })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId)
                    .then((todo) => {
                        expect(todo.completed).toBeFalsy();
                        expect(todo.completedAt).toBeNull();
                        done();
                    })
                    .catch(e => done(e));
            });
    });
});