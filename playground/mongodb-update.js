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
        .findOneAndUpdate({
            _id: new ObjectID('5acb4e2089dcfd5bf1053777')
        }, {
            $set: {
                name: 'Mr. Trump'
            },
            $inc: {
                age: 1
            }
        }, {
            returnOriginal: false
        })
        .then(result => console.log(JSON.stringify(result, undefined, 2)))
        .catch(err => console.error(`Unable to fectch error ${err}`));

    client.close();
});