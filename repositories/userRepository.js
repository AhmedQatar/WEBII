// repositories/userRepository.js
const { ObjectId } = require('mongodb');

function createUser(db, user) {
  return db.collection('user').insertOne(user);
}

function findUserByEmail(db, email) {
  return db.collection('user').findOne({ email });
}

function findUserById(db, userId) {
  return db.collection('user').findOne({ _id: new ObjectId(userId) });
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};
