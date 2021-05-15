var express = require('express');
var router = express.Router();
var products = require('../models/products.js');
const checkAuth = require('../middleware/check-auth');


router.post('/v2/products', checkAuth, function (req, res, next) {
    // SAVE USING PROMISE
    console.log("Save API Called");
    // console.log(req.body);
    // console.log(req.userData);
    if (req.userData.plan_type == 'freeware') {
        return res.status(405).json({ message: "Only for Paid Users" });
    }
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Invalid Request, Body not found" });
    }

    if (!req.body.name || !req.body.color || !req.body.brand_name) {
        return res.status(400).send({ message: "Error! Missing Crucial Data" });
    }
    var data = new products({

        "description": req.body.description,
        "name": req.body.name,
        "lname": req.body.name.toLowerCase(),
        "category": req.body.category,
        "price": req.body.price,
        "brand_id": req.body.brand_id,
        "brand_name": req.body.brand_name.toLowerCase(),
        "assets":
            req.body.assets,
        "shipping":
            req.body.shipping,

        "specs":

            req.body.specs,        //array object
        "attributes":

            req.body.attributes    //arrayobject
        ,
        "price": req.body.price,

        "variants": req.body.variants,      //arrayobject

        "color": req.body.color.toLowerCase(),

        "lastUpdated": new Date()

    });

    data.save()
        .then((result) => {
            if (result) res.status(201).json({ message: "Record Added", result: result })
        }).catch((e) => {
            next(e);
        });
});



router.patch('/v2/products/:id', checkAuth, function (req, res, next) {
    //USING PROMISE
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Invalid Request" });

    }
    let updateObject = req.body;
    let id = req.params.id;

    products.findById({ _id: req.params.id }).exec()
        .then((user) => {

            if (user) {

                products.updateOne({ _id: id }, { $set: updateObject }).exec()

                    .then((result) => {

                        if (result) res.status(201).json({ message: "Updated", result: result });


                    }).catch((e) => {
                        next(e);
                    });
            }

        }).catch((e) => {
            next(e);
        });
});


router.delete('/v2/products/:id', checkAuth, function (req, res, next) {

    if (!req.params.id) {
        return res.status(400).json({ message: "Invalid Request, No ID found" });
    }
    products.deleteOne({ _id: req.params.id }).exec()
        .then((result) => {
            if (result.deletedCount == 1) return res.status(200).json({ message: "Deleted the Record", result: result });
            else return res.status(404).json({ message: "Didn't Delete the Record", result: result });
        }).catch((e) => {
            next(e);
        });
});



router.get('/v2/products', checkAuth, function (req, res, next) {
    /* GET WITH PROMISE  */
    if (req.query.filter) {

        var filters = JSON.parse(req.query.filter);     //to be used only where there is no range

    }
    if (req.query.range) {
        let range_str = req.query.range;
        var range1 = range_str.substr(1, range_str.length - 2);
        range1 = JSON.parse(range1);                    //Range without [],to be used with FILTER AND RANGE

        var range = JSON.parse(req.query.range);    //to be used where no filter used

    }

    if (req.query.page) {
        var pageNumber = req.query.page;
    }
    if (req.query.limit) {

        var limit = req.query.limit;
    }
    var query;
    if (req.query.sort) {
        var sort = JSON.parse(req.query.sort);
    }
    var page = (pageNumber > 0 ? ((pageNumber - 1) * limit) : 0);


    if (!filters && !sort && !range) {
        console.log('Filter: NO, Sort: NO, Get All');
        query = products.find({}).skip(page).limit(limit);
    }
    else if (filters && sort && !range) {
        console.log('Filter: Yes, Sort: Yes, Range: No');

        query = products.find({ $and: filters }).sort(sort).skip(page).limit(limit);
    }
    else if (!filters && sort && !range) {
        console.log("Sort: YES, Filter: NO, Range:NO");
        console.log(sort);
        query = products.find({}).sort(sort).skip(page).limit(limit);
    }
    else if (filters && !sort && !range) {
        console.log("Sort: NO, Filter: Yes,Range: No");
        console.log(filters);
        query = products.find({ $and: filters }).skip(page).limit(limit);

    }
    else if (!filters && range && !sort) {
        console.log("No Filter, No Sort, Range: Yes")
        query = products.find({ $and: range }).skip(page).limit(limit);
    }
    else if (filters && range && !sort) {
        console.log("Filter: YES, Range: Yes, Sort: No")
        let filters_str = req.query.filter;
        let filters1 = filters_str.substr(1, filters_str.length - 2);
        filters1 = JSON.parse(filters1);  //FILTER without [],to be used with FILTER AND RANGE


        /*
        FORMAT FOR USING AND:
        find({ $and: [{"color":"Black"} ,  { price: { '$gt': 55000 } } ]});  */

        query = products.find({ $and: [filters1, range1] }).skip(page).limit(limit);
    }
    else if (range && sort && !filters) {

        console.log("Sort: YES, Filter: NO, Range:Yes");
        console.log(sort);
        query = products.find({ $and: range }).sort(sort).skip(page).limit(limit);
    }
    else if (sort && filters && range) {
        console.log("Sort: YES, Filter: YES, Range:Yes");
        let filters_str = req.query.filter;
        let filters1 = filters_str.substr(1, filters_str.length - 2);
        filters1 = JSON.parse(filters1);        //FILTER without [],to be used with FILTER AND RANGE

        query = products.find({ $and: [filters1, range1] }).sort(sort).skip(page).limit(limit);
    }
    query.exec()
        .then((result) => {

            if (result) res.status(200).json({ result: result });
        }).catch((e) => {

            next(e);
        });;
});

module.exports = router;