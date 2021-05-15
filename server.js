var express = require('express');
var bodyParser = require('body-parser');
var app = express();
let morgan = require('morgan');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));

const test = require("@adesh_rudra/test");

var cors = require('cors');

let config = require('config'); //we load the db location from the JSON files
const config1 = require('./config/local');
/* process.env.JWT_KEY_FREE_ENDPOINTS = config1.JWT_KEY_FREE_ENDPOINTS;
 process.env.JWT_KEY_PAID_ENDPOINTS = config1.JWT_KEY_PAID_ENDPOINTS; */
process.env.JWT_KEY = config1.JWT_KEY;

//db options
let options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};

//db connection     
var mongoose = require('mongoose');
mongoose.connect(config.DBHost, options);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//don't show the log when it is test
if (config.util.getEnv('NODE_ENV') !== 'test') {
    //use morgan to log at command line
    app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}

// app.use(cors());
app.options('*', cors());
// cors({credentials: true, origin: true});


app.use(function (req, res, next) {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Accept');

    next();
});


var userroutes = require('./server/routes/register_api.js');
app.use('/register', userroutes);
var userroutes1 = require('./server/routes/products_api.js');
app.use('/api', userroutes1);


// app.route("/api/v1/product")
//     .get(product.load);

// app.get('/', function (req, res) {

//     res.send('Node is running here');

// })
app.listen(3000);

app.get('/', (req, res) => {

    res.send("Node is Running");
})

app.use((req, res, next) => {
    // res.status(404).json({ message: "Sorry can't find that!" });
    const error = new Error('Route Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 422);

    res.json({
        error: {
            message: error.message
        },
        stack: error.stack
    });
});



console.log('Running at 3000');
var a="Hello There How Are You";
console.log(test(a));

module.exports = app; 
