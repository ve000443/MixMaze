var express = require("express");
var cors = require("cors");
var mongoose = require('mongoose');
var fs = require("fs");
var bodyParser = require('body-parser');

mongoose.connect("mongodb://xythe.xyz:27017/mixmaze");


var userSchema = {
    pseudo: String,
    password: String,
    email: String,
    role: String
};

var mixSchema = {
    owner: String,
    name: String,
    music: String,
    data : String
};

var musicSchema = {
    musicName: String,
    musicPath: String,
    musicFiles : [String]
};

var starSchema = {
    mixName: String,
    userName: String,
    star: Number
};

var User = mongoose.model('User', userSchema, 'user');
var Music = mongoose.model('Music', musicSchema, 'music');
var Mix = mongoose.model('Mix', mixSchema, 'mix');
var Star = mongoose.model('Star', starSchema, 'star');


/*User.remove({}, function(err){
        if(err) throw err;
});
*/

/*Mix.remove({}, function(err){
    if (err) throw err;
});*/

/*Music.remove({}, function(err){
        if(err) throw err;
});*/


/*
fs.readdir("./musics", function(err, items) {
        items.forEach(function(item){
                fs.readdir("./musics/"+item, function(err, musics){
                    var music = new Music({ musicName: item, musicPath: "/musics/"+item, musicFiles: musics });

                    music.save(function (err) {
                        if (err) throw err;
                    })
                });
        });
});*/

var app = express();
app.use(cors());

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get("/users", function(req, res){
    User.find(function (error, results) {
        if (error) throw error;
        else{
            res.statusCode = 200;
            res.send(results);
        }
    });
});

app.get("/users/:pseudo", function(req, res){
    var query  = User.where({ pseudo: req.params.pseudo });
    query.findOne(function (err, user) {
        if (err) throw err;
        else{
            res.statusCode = 200;
            res.send(user);
        }
    });
});

app.post("/users", function(req, res){
    if (!req.body) return res.sendStatus(400)
    var json = req.body;
    console.log(json);
    var query  = User.where({ pseudo: json.pseudo });
    query.findOne(function (err, user) {
        if (err) throw err;
        console.log(user);
        if(user === null){
            var user = new User({ pseudo: json.pseudo, email: json.email, password: json.password, role: "member" });

            user.save(function (err) {
                if (err) throw err;
                else
                    res.sendStatus(201);
            });
        }
        else{
            res.sendStatus(403);
        }
    });
});

app.put("/users", function(req, res){
    if (!req.body) return res.sendStatus(400)
    var json = req.body;
    var query  = User.where({ pseudo: json.pseudo });
    query.findOne(function (err, user) {
        if (err) throw err;
        if(json.applicant !== undefined && json.applicant === "admin"){
            user.role = json.role;
            user.save(function (err) {
               res.sendStatus(201);
            });
        }
        else{
            res.sendStatus(403);
        }
    });
});

app.delete("/users/:applicant/:pseudo", function(req, res){
    var applicant = req.params.applicant;
    var query  = User.where({ pseudo: req.params.pseudo });
    query.findOne(function (err, user) {
        if (err) throw err;
        if(applicant === "admin" && applicant !== undefined){
            user.remove();
            res.sendStatus(200);
        }
        else{
            res.sendStatus(403);
        }
    });
});

app.get("/musics", function(req, res){
    Music.find(function(error, results){
        if (error) throw error;
        else{
            res.statusCode = 200;
            res.send(results);
        }
    })
});

app.get("/mix", function(req, res){
    Mix.find(function(error, results){
        if(error) throw error;
        else{
            res.statusCode = 200;
            res.send(results);
        }
    })
});

app.get("/mix/:musicName", function(req, res){
    var query  = Mix.where({ music: req.params.musicName });
    query.find(function (err, mix) {
        if (err) throw err;
        if (mix) {
            res.statusCode = 200;
            res.send(mix);
        }
    });
});

app.get("/musics/:musicname", function(req, res){
    var query  = Music.where({ musicName: req.params.musicname });
    query.findOne(function (err, music) {
        if (err) throw err;
        if (music) {
            res.statusCode = 200;
            res.send(music);
        }
    });
});



app.post("/mix", function(req, res){
    if (!req.body) return res.sendStatus(400)
    var json = req.body;
    var query  = User.where({ pseudo: json.owner });
    query.findOne(function (err, user) {
        if (err) throw err;
        if(user.role !== undefined && user.role === "member" || user.role === "moderator" || user.role === "admin"){
            query = Mix.where({ name: json.name });
            query.findOne(function(err, mix){
                if(mix === null){
                    var mix = new Mix({owner: json.owner, name: json.name, music : json.music, data: json.data}) ;

                    mix.save(function (err) {
                        if (err) throw err;
                        else
                            res.sendStatus(201);
                    });
                }
                else{
                    res.sendStatus(403);
                }
            });
        }
        else{
            res.sendStatus(403);
        }
    });
});

app.delete("/mix/:mixname/:user", function(req, res){
    var userQ  = User.where({ pseudo: req.params.user });
    var mixQ  = Mix.where({ name: req.params.mixname });
    userQ.findOne(function(err, user){
      if(err) throw err;
      mixQ.findOne(function(err, mix){
        if(mix === null || user === null) res.sendStatus(404);
        else if (mix.owner === user.name || user.role === 'moderator' || user.role==='admin'){
          mix.remove();
          res.sendStatus(200);
        } else {
          res.sendStatus(403);
        }
      });
    });
});

app.put("/mix", function(req, res){
    if (!req.body) return res.sendStatus(400)
    var json = req.body;
    var query  = User.where({ pseudo: json.owner });
    query.findOne(function (err, user) {
        if (err) throw err;
        if(user.role !== undefined && user.role === "member" || user.role === "moderator" || user.role === "admin"){
            var query  = Mix.where({ name: json.name, owner: user.pseudo });
            query.findOne(function(err, mix){
                if(err || mix === null) res.sendStatus(403);
                else{
                    mix.data = json.data;
                    mix.save(function (err) {
                        res.sendStatus(201);
                    });
                }
            });
        }
        else{
            res.sendStatus(403);
        }
    });
});

app.get("/star", function(req, res){
    Star.find(function(error, results){
        if(error) throw error;
        else{
            res.statusCode = 200;
            res.send(results);
        }
    })
});

app.get("/star/:mixName", function(req, res){
    var query  = Star.where({ mixName: req.params.mixName });
    query.find(function (err, stars) {
        if (err) throw err;
        else{
            res.statusCode = 200;
            res.send(stars);
        }
    });
});

app.get("/star/:mixName/:userName", function(req, res){
    var query  = Star.where({ mixName: req.params.mixName, userName: req.params.userName });
    query.find(function (err, stars) {
        if (err) throw err;
        else{
            res.statusCode = 200;
            res.send(stars);
        }
    });
});

app.post("/star", function(req, res){
    if (!req.body) return res.sendStatus(400)
    var json = req.body;
    var query  = User.where({ pseudo: json.userName });
    query.findOne(function (err, user) {
        if (err) throw err;
        if (user.role !== undefined && user.role === "member" || user.role === "moderator" || user.role === "admin"){
            query = Star.where({ mixName: json.mixName, userName: json.userName });
            query.findOne(function(err, star){
                if(star === null){
                    var starsave = new Star({mixName: json.mixName, userName: json.userName, star: json.star}) ;
                    starsave.save(function (err) {
                        if (err) throw err;
                        else
                            res.sendStatus(201);
                    });
                }
                else{
                    res.sendStatus(403);
                }
            });
        }
        else{
            res.sendStatus(403);
        }
    });
});

app.put("/star", function(req, res){
    if (!req.body) return res.sendStatus(400)
    var json = req.body;
    var query  = User.where({ pseudo: json.userName });
    query.findOne(function (err, user) {
        if (err) throw err;
        if(user.role !== undefined && user.role === "member" || user.role === "moderator" || user.role === "admin"){
            var query  = Star.where({ mixName: json.mixName, userName: json.userName });
            query.findOne(function(err, star){
                star.star = json.star;

                star.save(function (err) {
                    res.sendStatus(201);
                });
            });
        }
        else{
            res.sendStatus(403);
        }
    });
});

app.listen(8080);
