var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure,
    
    /*server connection parameters */
    server = new Server('localhost', 27017, {auto_reconnect: true}),
    /* Create a database "test" in Mongo DB */
    db = new Db('test', server, {safe: true}),
    /*use this variable instead of using collection name directly*/
    yourCollectionName = 'user';

//open database connection
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to your 'test' mongo database");
        db.collection(yourCollectionName, {strict:true, safe:true}, function(errCol, collection) {
            if (errCol) {
                console.log("The "+yourCollectionName+" collection doesn't exist");
                createCollection();
            }
        });
    } else {
  	console.log("There is no 'test' database in MongoDB. Please create a database called 'test' in Mongo and proceed... ");
    }
});

/*
*  Create a collection for database
*/
var createCollection = function() {
    db.createCollection("user", function(err, collection){
    });
    /* Insert some sample data to database */
    insertUserData();
}
var insertUserData = function() {

    var users = [
        {
            email: "colin1@aaaa.xx",
            username: "colin1",
            password: "123456",
            created: Date.now()
        },
        {
            email: "colin2@bbbb.xx",
            username: "colin2",
            password: "123456",
            created: Date.now()
        },
        {
            email: "colin3@cccc.xx",
            username: "colin3",
            password: "123456",
            created: Date.now()
        },
        {
            email: "colin4@dddd.xx",
            username: "colin4",
            password: "123456",
            created: Date.now()
        }
    ];

    db.collection(yourCollectionName, function(err, collection) {
        collection.insert(users, {safe:true}, function(err, result) {
            console.log(result);
            if (result) console.log("Sucessfully inserted sample data to user collection");
        });
    });

};


/*
*  Renders to index page
*/
exports.index = function(req, res){
    res.render('index', { user: req.session.username, title: "colindemo"});
};

/*
*  listusers via JSON.
*/
exports.listusers = function(req, res) {
    if (!exports.isLoggedIn(req, res)) {
        return res.end('{"message":"you need login"}');
    };
    db.collection(yourCollectionName, function(err, collection) {
        collection.find().toArray(function(err, users) {
            res.writeHead(200,{'Conten-Type':'application/json'});//sending data via json
            var str='[';
            users.forEach(function(user){
                str = str + '{"username":"' +user.username+
                '","password":"'+user.password+
                '","_id":"'+user._id +
                '","email":"'+user.email +'"},'+
                '\n'
            });
            str=str.trim()
            str=str.substring(0,str.length-1);
            str=str+']';
            res.end(str);
            
        });
    });
};

/*
*  add new user
*/
exports.newUser = function(req, res){
    //must login before operate users
    if (!exports.isLoggedIn(req, res)) {
        return res.end('{"message":"you need login"}');
    };
    req.assert('email', 'Please enter a valid email').len(6,64).isEmail();
    req.assert('username', "The username can't be empty!").notEmpty();
    req.assert('pwd', "The password can't be empty and 6 - 16 characters required").notEmpty().len(6,16);
    req.assert('confirmpwd', "The confirm password can't be empty").notEmpty();
    req.assert('pwd', 'Passwords do not match').equals(req.param('confirmpwd'));
    
    res.writeHead(200,{'Conten-Type':'application/json'});//sending data via json
    var errors = req.validationErrors();
    if (errors) {
        return res.end('{"message":"'+'login:'+req.session.username+',  username:'+req.body.username
        +', add user Err:'+errors[0].msg+' , email:'+req.body.email+'"}'
        );
    };

    db.collection(yourCollectionName, function (err, collection) {
        collection.findOne({'email':req.body.email}, function(err, result) {
            if (result) {
                res.end('{"message":"'+'login:'+req.session.username+',  username:'+req.body.username
                +', add user Err:'+'This email is already exist!'+' , email:'+req.body.email+'"}'
                );
            } else {
                collection.insert({
                    email:req.body.email,
                    username:req.body.username,
                    password:req.body.pwd,
                    created: Date.now()
                }, {safe:true}, function (err, result) {
                    if (result) {
                        res.end('{"message":"'+'login:'+req.session.username+',  username:'+req.body.username
                        +', success:'+'add user successfully!'+' , email:'+req.body.email+'"}'
                        );
                    }
                });
            }
        });
    });

};

/*
*  update user.
*/
exports.updateUser = function(req, res) {
    if (!exports.isLoggedIn(req, res)) {
        return res.end('{"message":"you need login"}');
    };
    req.assert('email', 'Please enter a valid email').len(6,64).isEmail();
    req.assert('username', "The username can't be empty!").notEmpty();
    req.assert('pwd', "The password can't be empty and 6 - 16 characters required").notEmpty().len(6,16);
    
    res.writeHead(200,{'Conten-Type':'application/json'});//sending data via json
    var errors = req.validationErrors();
    if (errors) {
        return res.end('{"message":"'+'login:'+req.session.username+',  username:'+req.body.username
        +', update user Err:'+errors[0].msg+' , email:'+req.body.email+'"}'
        );
    };
    
    var id = req.body._id;
    console.log('update user: ' + id);
    db.collection(yourCollectionName, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)},{email:req.body.email,username:req.body.username,password:req.body.pwd}, {safe:true}, function(err, result) {
            if (err) {
                res.end('{"message":"'+'update error:An error has occurred - ' + err+'"}');
            } else {
                res.end('{"message":"'+'success: user is updated"}');
            }
        });
    });
}

/*
*  Delete the user.
*/
exports.deleteUser = function(req, res) {
    if (!exports.isLoggedIn(req, res)) {
        return res.end('{"message":"you need login"}');
    };
    var id = req.params.id;
    console.log('Deleting user: ' + id);
        db.collection(yourCollectionName, function(err, collection) {
            collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
                res.writeHead(200,{'Conten-Type':'application/json'});//sending data via json
                if (err) {
                    res.end('{"message":"'+'delete error:An error has occurred - ' + err+'"}');
                } else {
                    res.end('{"message":"'+'success: user is deleted"}');
                }
            });
        });
}


/*
*  Submit the username and password for authorization
*/
exports.login = function(req, res){

    req.assert('username', "The username can't be empty!").notEmpty();
    req.assert('pwd', "The password can't be empty!").notEmpty().len(6,16);

    res.writeHead(200,{'Conten-Type':'application/json'});//sending data via json
    var errors = req.validationErrors();
    if (errors) {
        return res.end('{"currentuser":"","message":"'+'error:An error has occurred - ' + errors[0].msg+'"}');
    }

    db.collection(yourCollectionName, function(err, collection) {
        collection.findOne({'username':req.body.username, 'password':req.body.pwd}, function(err, result) {
            if (result) {
                req.session.username = req.body.username;
                res.end('{"currentuser":"'+req.session.username+'"}');
                
            } else {
                res.end('{"currentuser":"","message":"username:'+req.body.username
                        +', loginErr:'+'Username or password is wrong!"}');
            }
        });
    });

};


/*
*  Check the user is logged or not.
*/
exports.isLoggedIn = function(req, res) {
    if (typeof req.session.username !== 'undefined') {
        return true;
    }
    return false;
}

/*
*  Logout current user and clear session
*/
exports.logout = function(req, res){
    req.session.destroy();
    //res.redirect('/');
};


/*
*  Check the user is logged or not.
*/
exports.currentuser = function(req, res) {
    res.writeHead(200,{'Conten-Type':'application/json'});//sending data via json
    res.end('{"currentuser":"'+req.session.username+'"}');
}