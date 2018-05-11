const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const { populateTodos, populateUsers, todos, users } = require('./seed/seed');
const { User } = require('./../models/user');
const { Todo } = require('./../models/todo');
const { app } = require('./../server');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
          expect(todos.length).toBe(todos.length);
          expect(todos[todos.length - 1].text).toBe(text);
          done();
        }).catch(e => done(e));
      });
  });

  it('should not create todo with invalid data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(todos.length);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos from database', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return doc for wrong user', (done) => {
    request(app)
      .get(`/todos/${todos[2]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if _id is invalid', (done) => {
    request(app)
      .get('/todos/123')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    const fakeId = new ObjectID();
    request(app)
      .get(`/todos/${fakeId.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete todo', (done) => {
    let hexId = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
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

  it('should not delete todo for wrong user', (done) => {
    let hexId = todos[2]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if _id is invalid', (done) => {
    request(app)
      .delete('/todos/123')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    const fakeId = new ObjectID();
    request(app)
      .delete(`/todos/${fakeId.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update todo', (done) => {
    let hexId = todos[0]._id.toHexString();
    let newText = 'New text for testing the PATCH method.';
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
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

  it('should not update todo for wrong user', (done) => {
    let hexId = todos[2]._id.toHexString();
    let newText = 'New text for testing the PATCH method.';
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text: newText,
        completed: true,
        completedAt: new Date()
      })
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    let hexId = todos[0]._id.toHexString();
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
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
            expect(todo.completedAt).toBe(null);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe('GET /users/me', () => {
  it('should return user', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 code', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create new user', (done) => {
    let email = 'testMail@testMail.ru';
    let password = '123abc!';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          done(err);
        }

        User.findOne({ email })
          .then((user) => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password);
            done();
          })
          .catch((e) => done(e));
      });
  });

  it('should return validation error if request invalid', (done) => {
    let email = 'not_email';
    let password = '12345';
    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });

  it('should not create create user if email in use', (done) => {
    let email = users[0].email;
    let password = users[0].password;

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should return token when user login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[0].email,
        password: users[0].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
          .then((user) => {
            expect(user.tokens[1]).toMatchObject({
              access: 'auth',
              token: res.headers['x-auth']
            });
            done();
          })
          .catch((e) => done(e));
      });
  });

  it('should reject with inavalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[0].email + 'someString',
        password: users[0].password + 'someString'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).not.toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }
        
        User.findById(users[0]._id)
          .then((user) => {
            expect(user.tokens.length).toBe(1);
            done();
          })
          .catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
