// import jwt_decode from "jwt-decode";
const jwt_decode = require('jwt-decode');
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var Users = require('../models/users')
var Letters = require('../models/letters')
var Datadates = require('../models/datadates')
var Maps = require('../models/maps');

// ----------------------------CHALLENGE 30----------------------------
router.get('/users', function (req, res) {
    res.json({
        data: 'Test'
    })
});

router.post('/users/register', function (req, res, next) {
    var { email, password, retypepassword } = req.body;

    const token = jwt.sign({ email }, 'my_secret_key');

    Users.findOne({ email: email }, function (err, data) {
        if (err) return handleError(err);
        if (data) {
            res.status(201).json({ message: 'Email already exists' })
        } else {
            if (password === retypepassword) {
                Users.create({ email, password, token }, function (err, data) {
                    res.status(201).json({
                        data: {
                            email: data.email
                        },
                        token: data.token
                    })
                })
            } else {
                res.status(201).json({ message: "Password not match" })
            }
        }
    })
});

router.post('/users/login', function (req, res, next) {
    var { email, password } = req.body;
    // const token = jwt.sign({ email }, 'my_secret_key');

    Users.findOne({ email: email }, function (err, data) {
        if (err) return handleError(err);
        if (data) {
            if (data.password === password) {
                jwt.sign({ email }, 'secretkey', (err, token) => {
                    Users.updateMany({ email: email }, { $set: { token: token } }, function (err, response) {

                        res.status(201).json({
                            data: {
                                email: data.email
                            },
                            token: token
                        })
                    })
                })
            } else {
                res.status(201).json({
                    msg: "Password not match"
                })
            }
        } else {
            res.json({
                msg: "Email not exists"
            })
        }
    })
})

router.post('/users/check', verifyToken, function (req, res, next) {
    const token = req.token;
    try {
        let data = jwt_decode(token);
        if (data) {
            Users.findOne({ email: data.email }, (err, user) => {
                if (!user) {
                    res.status(201).json({ "valid": false })
                } else {
                    res.status(201).json({ "valid": true })
                }
            });
        } else {
            res.status(201).json({ "valid": false })
        }

    } catch (e) {
        res.status(201).json({ "msg": false, "valid": false })
    }
});


router.get('/users/destroy', verifyToken, function (req, res, next) {
    var token = req.headers['token']
    try {
        res.clearCookie(token);
        res.json({
            msg: req.token
        })
    } catch (error) {
        res.status(500).send(error)
    }
})


// ----------------------------CHALLENGE 31----------------------------
router.post('/data', function (req, res, next) {
    var { letter, frequency } = req.body;
    Letters.create({ letter, frequency }, function (err, response) {
        if (err) res.sendStatus(403)
        res.status(201).send({
            success: true,
            message: "data have been added",
            data: {
                _id: response.id,
                letter: response.letter,
                frequency: response.frequency
            }
        })
    })
})

router.post('/data/search', function (req, res, next) {
    var { letter, frequency } = req.body;
    Letters.find({ $or: [{ letter, frequency }, { letter }, { frequency }] }, function (err, response) {
        if (err) res.sendStatus(403)
        if (response.length > 0) {
            res.status(201).send({
                data: response
            })
        } else {
            res.status(201).send({
                success: false,
                msg: "Result Not Found"
            })
        }
    })
})

router.get('/data', function (req, res) {
    Letters.find({}, function (err, data) {
        res.status(201).json({
            data,
            message: 'success'

        })
    });
})

router.put('/data/:id', (req, res) => {
    var id = req.params.id
    Letters.findOneAndUpdate({ _id: id },
        {
            letter: req.body.letter,
            frequency: req.body.frequency
        }, { new: true }, function (err, data) {
            if (err) res.sendStatus(403)
            res.status(201).json({
                data
            })
        })
})

router.delete('/data/:id', (req, res) => {
    var id = req.params.id
    console.log(id)
    Letters.findOneAndDelete({ _id: id }, function (err, data) {
        if (err) res.sendStatus(403)
        res.status(201).json({
            message: "success"
        })
    })
})

router.get("/data/:id", (req, res) => {
    let id = req.params.id
    Letters.findById({ _id: id }, function (err, data) {
        if (data) {
            res.json({
                success: true,
                message: "data found",
                data
            })
        } else {
            res.status(201).json({
                success: false,
                message: "data not found"
            })
        }
    })
})

// ----------------------------CHALLENGE 32----------------------------

//Browse
router.post('/datadate/search', function (req, res, next) {
    var { letter, frequency } = req.body;
    Datadates.find({ $or: [{ letter, frequency }, { letter }, { frequency }] }, function (err, response) {
        if (err) res.sendStatus(403)
        if (response.length > 0) {
            res.send({
                data: response
            })
        } else {
            res.status(201).send({
                success: false,
                msg: "Result Not Found"
            })
        }
    })
})

//Read
router.get('/datadate', function (req, res) {
    Datadates.find({}, function (err, data) {
        res.status(201).json({
            data,
            message: 'success'

        })
    });
})

//Edit
router.put('/datadate/:id', (req, res) => {
    var id = req.params.id
    Datadates.findOneAndUpdate({ _id: id },
        {
            letter: req.body.letter,
            frequency: req.body.frequency
        }, { new: true }, function (err, data) {
            if (err) res.sendStatus(403)
            res.status(201).json({
                data
            })
        })
})

//Add
router.post('/datadate', function (req, res, next) {
    var { letter, frequency } = req.body;
    Datadates.create({ letter, frequency }, function (err, response) {
        if (err) res.sendStatus(403)
        res.status(201).send({
            success: true,
            message: "data have been added",
            data: {
                _id: response.id,
                letter: response.letter,
                frequency: response.frequency
            }
        })
    })
})


//Delete
router.delete('/datadate/:id', (req, res) => {
    var id = req.params.id
    Datadates.findOneAndDelete({ _id: id }, function (err, data) {
        if (err) res.sendStatus(403)
        res.status(201).json({
            message: "success"
        })
    })
})

//Find
router.get("/datadate/:id", (req, res) => {
    let id = req.params.id
    Datadates.findById({ _id: id }, function (err, data) {
        if (data) {
            res.json({
                success: true,
                message: "data found",
                data
            })
        } else {
            res.status(201).json({
                success: false,
                message: "data not found"
            })
        }
    })
})
// ----------------------------CHALLENGE 33----------------------------

//Add
router.post('/maps', function (req, res, next) {
    var { title, lang, lat } = req.body;
    Maps.create({ title, lat, lang }, function (err, response) {
        if (err) res.sendStatus(403)
        res.status(201).send({
            success: true,
            message: "data have been added",
            data: {
                _id: response.id,
                title: response.title,
                lat: response.lat,
                lang: response.lang
            }
        })
    })
})

//Browse
router.post('/maps/search', function (req, res, next) {
    var { title, lang, lat } = req.body;
    Maps.find({ $or: [{ title, lat, lang }, { title }, { lat }, { lang }] }, function (err, response) {
        if (err) res.sendStatus(403)
        if (response.length > 0) {
            res.send({
                data: response
            })
        } else {
            res.status(201).send({
                success: false,
                msg: "Result Not Found"
            })
        }
    })
})


//Read
router.get('/maps', function (req, res) {
    Maps.find({}, function (err, data) {
        res.status(201).json({
            data,
            message: 'read'

        })
    });
})


// Edit
router.put('/maps/:id', (req, res) => {
    var id = req.params.id
    Maps.findOneAndUpdate({ _id: id },
        {
            title: req.body.title,
            lat: req.body.lat,
            lang: req.body.lang
        }, { new: true }, function (err, data) {
            if (err) res.sendStatus(403)
            res.status(201).json({
                data
            })
        })
})

//Delete
router.delete('/maps/:id', (req, res) => {
    var id = req.params.id
    Maps.findOneAndDelete({ _id: id }, function (err, data) {
        if (err) res.sendStatus(403)
        res.status(201).json({
            message: "success"
        })
    })
})

//Find
router.get("/maps/:id", (req, res) => {
    let id = req.params.id
    Maps.findById({ _id: id }, function (err, data) {
        if (data) {
            res.json({
                success: true,
                message: "data found",
                data
            })
        } else {
            res.status(201).json({
                success: false,
                message: "data not found"
            })
        }
    })
})


function verifyToken(req, res, next) {
    const Authentication = req.headers['token'];
    if (Authentication) {
        const token = bearerHeader.split(' ')[1];
        req.token = token;
        next();
        return
    }
    res.send({ message: "Token Undefined!" });
}


module.exports = router;