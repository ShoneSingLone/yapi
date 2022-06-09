const mongoose = require('mongoose');
var { MongoClient } = require('mongodb');
const autoIncrement = require('./mongoose-auto-increment');

async function asyncInitDBConnect(yapi) {

    let config = yapi.configs;
    var connectString = '';
    const { database, port, servername, user, pass, authSource } = config.db;

    if (config.db.connectString) {
        connectString = config.db.connectString;
    } else {
        connectString = `mongodb://${user}:${pass}${servername}:${port}/${database}`;
        if (authSource) {
            connectString = connectString + `?authSource=${authSource}`;
        }
    }


    try {
        yapi.mongoClient = await MongoClient.connect(connectString);
        yapi.db = await yapi.mongoClient.db(database);
        yapi.dbModel = function (model, schema) {
            if (schema instanceof mongoose.Schema === false) {
                schema = new mongoose.Schema(schema);
            }

            schema.set('autoIndex', false);

            return mongoose.model(model, schema, model);
        };


        yapi.setCollection = async function (collectionName, ...args) {
            let collection = await yapi.db.collection(collectionName);
            const res = await collection.createIndex.apply(collection, args);
            console.log('🚀:', 'res', JSON.stringify(res, null, 2));
            return res;
        };
        yapi.commons.log('mongodb load success...');
        autoIncrement.initialize();
        return yapi;
    } catch (error) {
        yapi.commons.log(error, ', mongodb Authentication failed', 'error');
    }
}




exports.asyncInitDBConnect = asyncInitDBConnect;
