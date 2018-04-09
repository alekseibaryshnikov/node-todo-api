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
        .deleteMany({
            name: 'Aleksei Barysnikov'
        })
        .then((docs) => {
            console.log(JSON.stringify(docs, undefined, 2));
        })
        .catch(err => console.error(`Unable to fectch error ${err}`));

    db.collection('Users')
        .findOneAndDelete({_id: new ObjectID('5acb1890fb02ff5aadab7df1')})
        .then(result => console.log(JSON.stringify(result, undefined, 2)))
        .catch(err => console.error(error));

    client.close();
});