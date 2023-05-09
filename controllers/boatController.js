'use strict';

const { Datastore } = require('@google-cloud/datastore');
const helpers = require('./helpers');

const datastore = new Datastore({
    projectId: 'a5-rest-api',
  });

const BOAT = "Boat";

// Begin boat Model Functions
function post_boat(name, type, length) {
    var key = datastore.key(BOAT);
    const new_boat = {
        "name": name,
        "type": type,
        "length": length,
    }
    return datastore.save({
        "key": key,
        "data": new_boat
    }).then(() => { return key });
}

async function delete_boat(id) {
    
    const key = helpers.getKey(datastore, BOAT, id);
    return datastore.delete(key);
}

function put_boat(id, name, type, length) {
    const key = helpers.getKey(datastore, BOAT, id);
    const edit_boat = {
        "name": name,
        "type": type,
        "length": length
    }
    return datastore.save({
        "key": key,
        "data": edit_boat
    });
}

function patch_boat(id, req, boat) {
    const key = helpers.getKey(datastore, BOAT, id);
    const body = req.body;
    console.log(body);
    for (const property in body) {
        if (property in boat[0] && property !== 'id') {
            boat[0][property] = body[property];
        }
    }
    console.log(boat);

    return datastore.save({
        "key": key,
        "data": boat[0]
    });
}

function get_boat(id) {
    const key = helpers.getKey(datastore, BOAT, id);
    return datastore.get(key).then(entity => {
        if (entity[0] === undefined || entity[0] === null) {
            return entity;
        } else {
            return entity.map(helpers.fromDatastore);
        }
    });
}


function name_check(name) {
    if (typeof name === 'string' || name instanceof String) {
        if (name.length <= 20) {
            return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(name);
        }
    }
    return false;
}

function input_check(req) {
    if (req.body.hasOwnProperty('type')) {
        const type = req.body.type;
        if (!(typeof type === 'string' || type instanceof String)
            || type.length > 20) {
            return false;
        }
    }
    if (req.body.hasOwnProperty('length')) {
        const length = req.body.length;
        if (typeof length !== 'number' && !(length instanceof Number)) {
            return false;
        }
    }
    return true;
}

async function check_duplicate_name(name) {
    const query = datastore.createQuery(BOAT);
    const ds = await datastore.runQuery(query);
    const list = ds[0].map(helpers.fromDatastore);
        console.log(list)
        for (const item of list) {
            if (item.name === name) {
                return true;
            }
        }
        return false;
}

module.exports = {
    post_boat,
    delete_boat,
    put_boat,
    patch_boat,
    get_boat,
    name_check,
    input_check,
    check_duplicate_name
}