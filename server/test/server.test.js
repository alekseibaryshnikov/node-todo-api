const expect = require('expect');
const request = require('supertest');

const {
    app
} = require('./../server');
const {
    Todo
} = require('./../models/todo');

let seed = () => {
    let seedArray = [];
    for (let i = 0; i <= 5; i++) {
        seedArray.push({
            text: `This is seed item #${i}`
        });
    }
    return seedArray;
}

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(seed());
    }).then(() => done());
});

describe('POST /todos', () => {
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
                    expect(todos.length).toBe(seed().length + 1);
                    expect(todos[seed().length].text).toBe(text);
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
                    expect(todos.length).toBe(seed().length);
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
                expect(res.body.todos.length).toBe(seed().length);
            })
            .end(done);
    });
});