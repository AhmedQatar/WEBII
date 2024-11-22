const { MongoClient } = require('mongodb');

async function connectToDatabase(uri) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    return client.db('language_exchange'); // Replace with your database name
}

module.exports = connectToDatabase;
