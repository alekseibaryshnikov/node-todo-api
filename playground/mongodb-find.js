const {
    MongoClient,
    ObjectID
} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) {
        return console.error('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    const db = client.db('todo-app');

    db.collection('Users')
        .find({
            name: 'Aleksei Barysnikov'
        })
        .toArray()
        .then((docs) => {
            console.log(JSON.stringify(docs, undefined, 2));
        })
        .catch(err => console.error(`Unable to fectch error ${err}`));
    client.close();
});