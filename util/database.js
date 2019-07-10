const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
    MongoClient.connect(
      "mongodb+srv://catarina:daztav-soCkek-nupfi3@cluster0-6anqz.mongodb.net/test?retryWrites=true&w=majority"
    )
    .then(client => {
        console.log('Connected to Database!');
        _db = client.db();
        callback();
    })
    .catch(error => {
        console.error(error);
        throw error;
    });
};

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No database found!'
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;