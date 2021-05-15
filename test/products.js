process.env.NODE_ENV = 'test';

let products = require('../server/models/products');
let register = require('../server/models/register');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

let should = chai.should();

var token = '';
chai.use(chaiHttp);

var product = new products(
    {


        description: "Puma Sports Maxima II",
        name: "Puma Maxima",
        category: "/mens/footwear",
        brand_id: "fd345rew2",
        brand_name: "Puma",
        assets:
        {
            imgs: [
                {
                    img: {
                        "height": "1900",
                        "src": "https://ffgfg",
                        "width": "1900"
                    }
                },
                {
                    img: {
                        "height": "1900",
                        "src": "https://wwwwwwww",
                        "width": "1900"
                    }
                },
                {
                    img: {
                        "height": "1900",
                        "src": "https://ewqqttt",
                        "width": "1900"
                    }
                }
            ]
        },
        shipping: {
            dimensions: {


                height: "20cm",
                length: "20cm",
                width: "30cm",
            },
            weight: "3.8kg",
        },
        specs: [
            {
                name: "Inner Material",
                val: "Fiber"
            },
            {
                name: "Outer Material",
                val: "Mesh"
            }
        ],
        attributes: [
            {
                name: "Material",
                value: "Mesh"
            },
            {
                name: "Brand",
                value: "Puma"
            },
            {
                name: "Size",
                value: "15.6"
            }
        ],
        price: {
            realPrice: "5500",
            salePrice: "4900",
            saleEndDate: "2050-12-31 23:59:59"
        },
        variants: {
            name: "size",
            values: [
                "7",
                "8",
                "9",
                "10",
                "11"
            ]
        },
        color: "Red"
    }
);
var user = new register({

    name: 'John Wayne',
    email: 'wayne@gmail.com',
    password: 'johnwayne666',
    plan_type:"silver"
});

var wrong_user = ({


    email: 'john1@gmail.com',
    password: 'johnwayne666'
});

describe('register', () => {
    beforeEach((done) => {
        register.remove({}, (err) => {

            done();
        });

    });

    describe('/Register User', () => {

        it('it should post one USER', (done) => {

            chai.request(server)
                .post('/register/register')
                .send(user)
                .end((err, res) => {

                    res.should.have.status(201);
                    res.body.user.should.have.property('_id');
                    res.body.user.should.have.property('createdAt');
                    res.body.message.should.be.eql('User registered')
                    done();
                });
        });

        it('password should be stored in HASH form', (done) => {

            chai.request(server)
                .post('/register/register')
                .send(user)
                .end((err, res) => {

                    res.should.have.status(201);
                    res.body.user.password.should.not.eql('johnwayne666');
                    done();
                });
        });
    });
});

describe('/Login User', () => {

    it('It should be a successfull Login', (done) => {

        user.save((err, result) => {


            chai.request(server)
                .post('/register/login')
                .send({
                    "email": 'wayne@gmail.com',
                    "password": 'johnwayne666'
                })

                .end((err, res) => {
                    // console.log(res);
                    res.should.have.status(200);
                    res.body.should.have.property('token');
                    res.body.should.have.property('message').eql("Auth OK");

                    done();

                });
        });

    });

    it('It should be able to access protected route', (done) => {

        user.save((err, result) => {


            chai.request(server)
                .post('/register/login')
                .send({
                    "email": 'wayne@gmail.com',
                    "password": 'johnwayne666'
                })

                .end((err, res) => {

                    res.should.have.status(200);
                    res.body.should.have.property('token');
                    res.body.should.have.property('message').eql("Auth OK");
                    /*   THIS TOKEN WILL BE USED IN ALL PRODUCTS METHODS FOR TESTING AUTHENTICATION    */
                    token = 'Bearer ' + res.body.token;
                    // console.log(res.body.token);
                    chai.request(server)
                        .get('/register/protected')
                        .set('Authorization', token)

                        .end((err, protected_response) => {
                            // console.log("userData_______");
                            // console.log(protected_response);
                            protected_response.should.have.status(200);
                            protected_response.body.should.have.property('message').eql('Welcome, your email is wayne@gmail.com');
                            protected_response.body.user.should.have.property('email')
                            // expect(protected_response.body.errors.length).to.be.equal(0);
                            done();
                        });
                });
        });

    });


    it('should respond error 401 for invalid credentials', (done) => {

        chai.request(server)
            .post('/register/login')
            .send(wrong_user)
            .end((err, res) => {

                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql("Auth error, email not found");
                done();
            });

    });

});

describe('products', () => {

    beforeEach((done) => {

        products.remove({}, (err) => {

            done();
        });
    });

    describe('/GET products', () => {

        it('it should get all the items', (done) => {

            chai.request(server)
                .get('/api/v1/products')
                .set('Authorization', token)
                .end((err, res) => {

                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });

        });

    });

    describe('/POST products', () => {

        it('it should POST one Product', (done) => {
            // console.log("Product Object");
            // console.log(product);
            chai.request(server)
                .post('/api/v1/products')
                .set('Authorization', token)
                .send(product)
                .end((err, res) => {
                    
                  
                    console.log(res.body);
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('description');
                    res.body.should.have.property('name');
                    res.body.should.have.property('lname');
                    res.body.should.have.property('category');

                    res.body.should.have.property('brand_id');
                    res.body.should.have.property('brand_name');
                    res.body.should.have.property('assets');
                    res.body.should.have.property('shipping');
                    res.body.should.have.property('specs');
                    res.body.should.have.property('attributes');
                    res.body.should.have.property('price');
                    res.body.should.have.property('color');
                    res.body.should.have.property('variants');
                    res.body.should.have.property('lastUpdated');
                    done();

                });
        });

        it('it should show error 400, no body found for POST Product', (done) => {
            // console.log("Product Object");
            // console.log(product);
            chai.request(server)
                .post('/api/v1/products')
                .set('Authorization', token)
                .send({})
                .end((err, res) => {
                    
                    console.log("res for Bad Insert ______");
                     console.log(res.body) ;
                    // console.log(res);
                    res.should.have.status(400);

                    res.body.should.have.property('message').eql('Invalid Request, Body not found');
                    done();

                });
        });
    });
});

describe('PATCH:id products', () => {

    it("it should update a book given the ID", (done) => {

        product.save((err, result) => {

            chai.request(server)
                .patch('/api/v1/products/' + result._id)
                .set('Authorization', token)
                .send({
                    color: "black"
                })
                .end((err, res) => {
                    console.log("res for Update ______");
                     console.log(res.body) ;
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('ok').eql(1);
                    res.body.should.have.property('nModified').eql(1);
                    res.body.should.have.property('n').eql(1);
                    res.body.should.have.property('nModified').eql(1);
                    done();
                });
        });
    });

    it("it should give error 400 for bad request,no body sent to update", (done) => {

        product.save((err, result) => {

            chai.request(server)
                .patch('/api/v1/products/' + result._id)
                .set('Authorization', token)
                .send({

                })
                .end((err, res) => {
                    console.log("res for bad Update ______");
                     console.log(res.body) ;
                    res.should.have.status(400);

                    res.body.should.have.property('message').eql('Invalid Request');
                    done();
                });
        });
    });

});


describe('DELETE/:id product', () => {

    it('Should DELETE a product given the ID', (done) => {

        product.save((err, result) => {
            // console.log("DELETE save called");
            //    await console.log(result);
            chai.request(server)
                .delete('/api/v1/products/' + result._id)
                .set('Authorization', token)
                .end((err, res) => {
                    console.log("res for delete ______");
                     console.log(res.body) ;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('ok').eql(1);
                    res.body.should.have.property('deletedCount').eql(1);
                    done();
                });
        })
    });
    it('It Should give an error 404, record not found for delete', (done) => {

        product.save((err, result) => {
            // console.log("DELETE save called");
            // console.log(result);
            chai.request(server)
                .delete('/api/v1/products/' + '5d15e382cbd6e127099910c2')
                .set('Authorization', token)
                .end((err, res) => {
                    console.log("res of delete(Wrong ID)_______________");
                    console.log(res.body);
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.result.should.have.property('ok').eql(1);
                    res.body.result.should.have.property('deletedCount').eql(0);
                    done();
                });
        });
    });


});

