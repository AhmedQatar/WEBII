// config/db.js
const { MongoClient } = require('mongodb');

async function connectToDatabase(uri) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  return client.db(); // Use the database specified in the URI
}

module.exports = connectToDatabase;
