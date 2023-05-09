'use strict';

const { Datastore } = require('@google-cloud/datastore');

// helper to set item id from datastore
function fromDatastore(item) {
    item.id = item[Datastore.KEY].id;
    return item;
}
// helper to get key from datastore
function getKey(datastore, kind, id) {
    return datastore.key([kind, parseInt(id, 10)]);
}


module.exports = {
    fromDatastore,
    getKey
}