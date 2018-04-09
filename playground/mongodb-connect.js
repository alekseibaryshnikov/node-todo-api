const {MongoClient} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) {
        return console.error('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    const db = client.db('todo-app');

    db.collection('Users').insertOne({
        name: 'Aleksei Baryshnikov',
        age: 30,
        location: 'Moscow'
    }, (err, result) => {
        if (err) {
            return console.error('unable to insert user', err);
        }
        
        console.log('User added', JSON.stringify(result.ops, undefined, 2));
    });

    client.close();
});