var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//PRODUCTS COLLECTION SCHEMA
var userschema = new Schema({
    booked: {
        type: Boolean,
        required: true,
        default:false
      },
    uid:String,
    description:String,
    name: String,
    lname: String,
    category: String,   
               
    brand_id: String,
    brand_name:String,

    assets: {
        imgs: [
            {
                img: {
                    height: String,     //"1900",
                    src: String,        //"http://imageURL"
                    width: String       //"1900"
                }
            },
            {
                img: {
                    height: String,     //"1900",
                    src: String,        //"http://imageURL"
                    width: String       //"1900"
                }
            },
            {
                img: {
                    height: String,     //"1900",
                    src: String,        //"http://imageURL"
                    width: String       //"1900"
                }
            }
        ]
    },
    shipping:{
        dimensions: {
            height: String,         // "13.0",
            length: String,         // "1.8",
            width: String           // "26.8"
        },
    
        weight: String ,            // "1.75"
    },
    specs: [
        {
            name: String,           // "Processor",
            val: String             //"i7"
        },
        {
            name: String,           // "RAM",
            val: String             //"8GB"
        },
        {
            name: String,           // HDD",
            val: String             //"500GB"
        }
    ],
    attributes: [
        {
            name: String,           // "Inner Material",
            value: String           //"Leather"
        },
        {
            name: String,           //"Upper Material",
            value: String           //"Synthetic"
        },
        {
            name: String,           // "Toe",
            value: String           // "Open toe"
        },
        {
            name: String,           // "Brand",
            value: String           // "Puma"
        }
    ],
    price: {
        realPrice:Number,
        salePrice:Number,
        saleEndDate:Date
    },
    color:String,

   variants:
        
        {
            name: String,    // "Size",
            values:[

            ]     
        },
        
    
    

    lastUpdated: Date         //1400877254787
}, { versionKey: false });

module.exports = mongoose.model('products', userschema);