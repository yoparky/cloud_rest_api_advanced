'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const json2html = require('json-to-html');

const boatController = require('../../controllers/boatController');

const app = express();
app.use(bodyParser.json());
const router = express.Router();

router.put('/', async function (req, res) {
    res.status(405).json({"Error": 'PUT and DELETE on whole database is not supported'});
});
router.delete('/', async function (req, res) {
    res.status(405).json({"Error": 'PUT and DELETE on whole database is not supported'});
});

router.post('/', async function (req, res) {
    if (!boatController.input_check(req)) {
        res.status(400).json({"Error": 'properties "type" must be a string under 21 characters and "length" must be a number'});        
    } else if (req.get('content-type') !== 'application/json') {
        res.status(415).json({"Error": 'Server only accepts application/json data'});
    } else if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    } else if (req.body.hasOwnProperty('name') && req.body.hasOwnProperty('type') && req.body.hasOwnProperty('length')) {
        var name = req.body.name;
        var type = req.body.type;
        var length = req.body.length;
        if (!boatController.name_check(name)) {
            res.status(400).json({"Error": 'property "name" must be a string under 21 characters that does not include special characters'});
        } else if (await boatController.check_duplicate_name(req.body.name)) {
            res.status(403).json({"Error": 'Boat with this name already exists'});
        } else {
            boatController.post_boat(name, type, length)
            .then(key => {
                // consider doing a get and returning a json of the actual db status
                res.status(201).json(
                    {
                        "id": key.id,
                        "name": name,
                        "type": type,
                        "length": length,
                        "self": req.protocol + "://" + req.get("host") + req.baseUrl + "/" + key.id
                    }
                )
            });
        }
    } else {
        res.status(400).json({"Error":  "The request object is missing at least one of the required attributes"});
    }
});

router.delete('/:boat_id', function (req, res) {
    if (req.params.boat_id === "null") {
        res.status(404).json({"Error": "No boat with this boat_id exists"});
    }

    res.set('Accept', 'GET, POST');
    boatController.get_boat(req.params.boat_id)
        .then(async boat => {
            if (boat[0] === undefined || boat[0] === null) {
                // no boat with id
                res.status(404).json({"Error": "No boat with this boat_id exists"});
            } else {
                // found boat with id
                await boatController.delete_boat(req.params.boat_id)
                    .then(res.status(204).end());
            }
        })
});

router.put('/:boat_id', function (req, res) {
    if (!boatController.input_check(req)) {
        res.status(400).json({"Error": 'properties "type" must be a string under 21 characters and "length" must be a number'});        
    } else if (req.get('content-type') !== 'application/json') {
        res.status(415).json({"Error": 'Server only accepts application/json data'});
    } else if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    } else if (req.params.boat_id === "null") {
        res.status(404).json({"Error": "No boat with this boat_id exists"});
    } else {
        boatController.get_boat(req.params.boat_id)
        .then(async boat => {
            if (boat[0] === undefined || boat[0] === null) {
                // no boat with id
                res.status(404).json({"Error": "No boat with this boat_id exists"});
            } else {
                // found boat with id
                if (req.body.hasOwnProperty('name') && req.body.hasOwnProperty('type') && req.body.hasOwnProperty('length')) {
                    var name = req.body.name;
                    var type = req.body.type;
                    var length = req.body.length;
                    if (!boatController.name_check(name)) {
                        res.status(400).json({"Error": 'property "name" must be a string under 21 characters that does not include special characters'});
                    } else if (await boatController.check_duplicate_name(req.body.name)) {
                        res.status(403).json({"Error": 'Boat with this name already exists'});
                    } else {
                        boatController.put_boat(req.params.boat_id, name, type, length)
                        .then(key => {
                            const self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.boat_id;
                            res.location(self);
                            res.status(303).json(
                                {
                                    "id": req.params.boat_id,
                                    "name": name,
                                    "type": type,
                                    "length": length,
                                    "self": req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.boat_id
                                }
                            );
                        });
                    }
                } else {
                    res.status(400).json({"Error": "The request object is missing at least one of the required attributes"});
                }
            }
        })
    }
});

router.patch('/:boat_id', function (req, res) {
    if (!boatController.input_check(req)) {
        res.status(400).json({"Error": 'properties "type" must be a string under 21 characters and "length" must be a number'});        
    } else if (req.get('content-type') !== 'application/json') {
        res.status(415).json({"Error": 'Server only accepts application/json data'});
    } else if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    } else if (req.params.boat_id === "null") {
        res.status(404).json({"Error": "No boat with this boat_id exists"});
    } else if (req.body.hasOwnProperty('id')) {
        res.status(400).json({"Error": "boat_id cannot be patched"});
    } else {
        boatController.get_boat(req.params.boat_id)
        .then(async boat => {
            if (boat[0] === undefined || boat[0] === null) {
                // no boat with id
                res.status(404).json({"Error": "No boat with this boat_id exists"});
            } else {
                if (req.body.hasOwnProperty('name') && !boatController.name_check(req.body.name)) {
                    res.status(400).json({"Error": 'property "name" must be a string under 21 characters that does not include special characters'});
                } else if (await boatController.check_duplicate_name(req.body.name)) {
                    res.status(403).json({"Error": 'Boat with this name already exists'});
                } else {
                    boatController.patch_boat(req.params.boat_id, req, boat)
                    .then(async key => {
                        var self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.boat_id;
                        res.location(self);
                        let boat = await boatController.get_boat(req.params.boat_id);
                        boat[0].self = self;
                        res.status(303).json(boat[0]);
                    });
                }
            }
        })
    }
});


router.get('/:boat_id', function (req, res) {
    if (req.params.boat_id === "null") {
        res.status(404).json({"Error": "No boat with this boat_id exists"});
    }

    boatController.get_boat(req.params.boat_id)
        .then(boat => {
            if (boat[0] === undefined || boat[0] === null) {
                // no boat with id
                res.status(404).json({"Error": "No boat with this boat_id exists"});
            } else {
                // found boat with id
                boat[0].self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.boat_id;
                if (req.accepts(['application/json'])) {
                    res.status(200).json(boat[0]);
                } else if (req.accepts(['text/html'])) {
                    res.status(200).send(json2html(boat[0]).slice(1,-1));
                } else {
                    res.status(406).json({"Error": 'Server only responds in application/json or text/html data'});
                }
            }
        })
});





module.exports = router;