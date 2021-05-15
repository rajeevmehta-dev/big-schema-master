/**
 * /api/routes.js
 * exports an express router.
 */

const express = require('express');
//create the express router that will have all endpoints
const router = express.Router();
//to generate the JWT
const jwt = require('jsonwebtoken');

//database
const mongoose = require('mongoose');
//import User
const User = require('../models/register');

//to encrypt
const bcrypt = require('bcrypt');

//import check-auth middleware
const checkAuth = require('../middleware/check-auth');



router.post('/register', (req, res, next) => {
    console.log("Register API Called");
    let hasErrors = false;
    let errors = [];

    if (!req.body.name) {
        //validate name presence in the request
        errors.push({ 'name': 'Name not received' })
        hasErrors = true;
    }
    if (!req.body.email) {
        //validate email presence in the request
        errors.push({ 'email': 'Email not received' })
        hasErrors = true;
    }
    if (!req.body.password) {
        //validate password presence in the request
        errors.push({ 'password': 'Password not received' })
        hasErrors = true;
    }
    if (!req.body.plan_type) {
        //validate password presence in the request
        errors.push({ 'plan_type': 'paid not received' })
        hasErrors = true;
    }

    if (hasErrors) {
        //if there is any missing field
        res.status(401).json({
            message: "Invalid input",
            errors: errors
        });

    } else {
        //if all fields are present
        //check if mail already exists
        User.findOne({ 'email': req.body.email }).then((doc, err) => {
            if (doc) {
                //if email already exists in DB, send error
                errors.push({ email: 'Email already registered' });
                res.status(422).json({
                    message: "Invalid email",
                    errors: errors
                })
            } else {
                //encrypt user password
                bcrypt.hash(req.body.password, 10, (err, hashed_password) => {
                    if (err) {
                        //error hashing the password
                        errors.push({
                            hash: err.message
                        });
                        return res.status(500).json(errors);
                    } else {
                        //if password is hashed
                        //create the user with the model
                        const new_user = new User({
                            //assign request fields to the user attributes

                            name: req.body.name,
                            email: req.body.email,
                            password: hashed_password,
                            plan_type: req.body.plan_type
                        });
                        //save in the database
                        new_user.save().then(saved_user => {
                            //return 201, message and user details
                            res.status(201).json({
                                message: 'User registered',
                                user: saved_user,
                                errors: errors
                            });
                        }).catch(err => {
                            //failed to save in database
                            errors.push(new Error({
                                db: err.message
                            }))
                            res.status(500).json(errors);
                        })
                    }
                });
            }
        })

    }

});

router.post('/login', (req, res, next) => {
    let hasErrors = false;
    let errors = [];

    //validate presence of email and password
    if (!req.body.email) {
        errors.push({ 'email': 'Email not received' })
        hasErrors = true;
    }
    if (!req.body.password) {
        errors.push({ 'password': 'Password not received' })
        hasErrors = true;
    }

    if (hasErrors) {
        //return error code an info
        res.status(422).json({
            message: "Invalid input",
            errors: errors
        });

    } else {
        //check if credentials are valid
        //try to find user in database by email
        User.findOne({ 'email': req.body.email }).then((found_user, err) => {
            try {
                if (err) next(err);
                if (!found_user) {
                    //return error, user is not registered
                    res.status(401).json({
                        message: "Auth error, email not found"
                    });
                } else {
                    var id = found_user._id;
                    var plan_type = found_user.plan_type;
                    //validate password
                    bcrypt.compare(req.body.password, found_user.password, (err, isValid) => {

                        if (err) {
                            next(err);

                        }
                        if (!isValid) {
                            //return error, incorrect password
                            res.status(401).json({
                                message: "Auth error, email not found"
                            });
                        } else {
                            //generate JWT token. jwt.sing() receives payload, key and opts.


                            var token = jwt.sign(
                                {
                                    email: req.body.email,
                                    plan_type: plan_type,
                                    _id: id
                                },
                                process.env.JWT_KEY,
                                {
                                    expiresIn: "1d"
                                }
                            );

                            let query = User.updateOne({ _id: id }, { $set: { token: token } });

                            query.exec(function (err, result) {
                                if (err) next(err);
                                console.log(result);
                            });


                            // }
                            //validation OK
                            res.status(200).json({
                                message: 'Auth OK',
                                token: token,
                                errors: errors
                            });
                        }

                    });
                }
            } catch (e) {
                next(e);
            }
        });

    }
});

router.get('/protected', checkAuth, (req, res, next) => {
    res.status(200).json({
        message: 'Welcome, your email is ' + req.userData.email,
        user: req.userData,
        errors: [],
    })
})


router.patch('/register/:id', checkAuth, function (req, res, next) {

    console.log("Patch Update API for Products Called");
    console.log(req.body);

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Invalid Request" });
    }
    let updateObject = req.body;
    let id = req.params.id;

    User.findById({ _id: req.params.id }, function (err, result) {
        if (err)
            next(err);

        if (!result && !err) {
            res.status(404).send('No record found to update');
        }
        else {

            if (result.token == req.original_token) {

                let query = User.updateOne({ _id: id }, { $set: updateObject });
                query.exec(function (err, result) {

                    if (err) next(err);
                    // console.log(result);
                    res.status(201).json(result);
                });
            }
            else {
                res.status(403).json({ message: "Not Authorized" });
            }
        }
    });
});

module.exports = router;