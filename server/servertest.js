/*jslint node: true */
/*jslint mocha: true */
'use strict';

var assert = require('assert');
var mongoose = require('mongoose');
var request = require("supertest");

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
}

var User = mongoose.model('User', userSchema, 'user');
var Music = mongoose.model('Music', musicSchema, 'music');
var Mix = mongoose.model('Mix', mixSchema, 'mix');
var Star = mongoose.model('Star', starSchema, 'star');

var url = "";

var user = {};
var mix = {};
var star = {};

var userAPI = "";
var mixAPI = "";
var musicAPI = "";
var starAPI = "";

describe('Serveur-side Tests', function() {
	before(function(done) {
		url = "http://xythe.xyz:8080";
		user.pseudo = "lovemocha";
		user.email = "test@mocha.test";
		user.password = "lovemocha";
		user.role = "member";

		mix.name = "lovemocha";
		mix.music = "marco";
		mix.data = "";
		mix.owner = "admin";

		star.mixName = "testmocha";
		star.userName = "admin";
		star.star = 3;

		userAPI = "/users";
		mixAPI = "/mix";
		musicAPI = "/musics";
		starAPI = "/star";

    	done();
  	});

	describe("Simple test of GET apis", function(){

	  	describe("GET /users", function(){
	  		it('should respond with an array of users', function(done){
	  			request(url)
	  			.get(userAPI)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, res.body instanceof Array);
	  				done();
	  			});
	  		});
	  	});

	  	describe("GET /mix", function(){
	  		it('should respond with an array of mix', function(done){
	  			request(url)
	  			.get(mixAPI)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, res.body instanceof Array);
	  				done();
	  			});
	  		});
	  	});

	  	describe("GET /musics", function(){
	  		it('should respond with an array of musics', function(done){
	  			request(url)
	  			.get(musicAPI)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, res.body instanceof Array);
	  				done();
	  			});
	  		});
	  	});

	  	describe("GET /star", function(){
	  		it('should respond with an array of stars', function(done){
	  			request(url)
	  			.get(starAPI)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, res.body instanceof Array);
	  				done();
	  			});
	  		});
	  	});
	});
	//********************  ADVANCED TESTS FOR USERS *************************//
	describe("Users tests", function(){
		var numberOfUsers = 0;

	  	describe("GET /users to fetch the number of users", function(){
	  		it('should retrieve user number in database', function(done){
	  			request(url)
	  			.get(userAPI)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				numberOfUsers = res.body.length;
	  				done();
	  			});
	  		});
	  	});

	  	describe("POST / users to create a new user", function(){
	  		it('/should create a new user an check if the number of users has changed', function(done){
	  			request(url)
	  			.post(userAPI)
	  			.send(user)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 201);
	  				done();
	  			});
	  		});
	  	});

	  	describe("GET /users to fetch the number of users", function(){
	  		it('should be the old number plus one', function(done){
	  			request(url)
	  			.get(userAPI)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, res.body.length === numberOfUsers+1);
	  				numberOfUsers = res.body.length;
	  				done();
	  			});
	  		});
	  	});


	  	describe("POST / users to create the same user", function(){
	  		it('/should return status code 403 and not create the user', function(done){
	  			request(url)
	  			.post(userAPI)
	  			.send(user)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 403);
	  				done();
	  			});
	  		});
	  	});

	  	describe("GET /users to fetch the number of users", function(){
	  		it('should be the same number of users because creation failed', function(done){
	  			request(url)
	  			.get(userAPI)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, res.body.length === numberOfUsers);
	  				done();
	  			});
	  		});
	  	});

	  	describe("GET /users/pseudo to fetch the user created before", function(){
	  		it('should return the user and status code 200', function(done){
	  			request(url)
	  			.get(userAPI+"/"+user.pseudo)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, res.body.length === 1);
	  				assert(true, user.pseudo === res.body.pseudo);
	  				done();
	  			});
	  		});
	  	});

	  	describe("PUT /users to update a user role", function(){
	  		it('should return status code 403 because only admin can update users', function(done){
	  			request(url)
	  			.put(userAPI)
	  			.send({applicant:"member", pseudo: user.pseudo, role: "moderator"})
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 403);
	  				done();
	  			});
	  		});
	  	});

	  	describe("PUT /users to update a user role", function(){
	  		it('should return status code 201 because the admin can update users', function(done){
	  			request(url)
	  			.put(userAPI)
	  			.send({applicant:"admin", pseudo: user.pseudo, role: "moderator"})
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 201);
	  				done();
	  			});
	  		});
	  	});

	  	describe("DELETE /users to delete a user", function(){
	  		it('should return status code 403 because only admin can delete users', function(done){
	  			request(url)
	  			.delete(userAPI+"/"+user.pseudo+"/toto")
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 403);
	  				done();
	  			});
	  		});
	  	});


	  	describe("DELETE /users to delete a user", function(){
	  		it('should return status code 200 because the admin deleted this user', function(done){
	  			request(url)
	  			.delete(userAPI+"/"+"admin"+"/"+user.pseudo)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				done();
	  			});
	  		});
	  	});
	});

	describe("Test to fetch a specfic music", function(){
		describe("GET /musics/musicName", function(){
	  		it('should return a single music', function(done){
	  			request(url)
	  			.get(musicAPI+"/marco")
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, res.body.length === 1);
	  				done();
	  			});
	  		});
	  	});
	});

	//********************  ADVANCED TESTS FOR MIX *************************//
	describe("Mix tests", function(){

		var numberOfMix = 0;
		var numberOfSpecificMusic = 0;
		describe("GET /mix to fetch the number of mix", function(){
	  		it('should retrieve mix number in database', function(done){
	  			request(url)
	  			.get(mixAPI)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				numberOfMix = res.body.length;
	  				done();
	  			});
	  		});
	  	});

	  	describe("GET /mix related to a music", function(){
	  		it('should be return status code 200 and a array of mix', function(done){
	  			request(url)
	  			.get(mixAPI+"/"+mix.music)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				numberOfSpecificMusic = res.body.length;
	  				done();
	  			});
	  		});
	  	});

	  	describe("POST / mix to create a new mix", function(){
	  		it('/should create a new mix an check if the number of mix has changed', function(done){
	  			request(url)
	  			.post(mixAPI)
	  			.send(mix)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 201);
	  				done();
	  			});
	  		});
	  	});

	  	describe("GET /mix related to a music after creation", function(){
	  		it('should be return status code 200 and a array of mix plus the new mix', function(done){
	  			request(url)
	  			.get(mixAPI+"/"+mix.music)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, numberOfSpecificMusic+1 === res.body.length)
	  				done();
	  			});
	  		});
	  	});

	  	describe("GET /mix to fetch the number of mix", function(){
	  		it('should be the old number plus one', function(done){
	  			request(url)
	  			.get(mixAPI)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, res.body.length === numberOfMix+1);
	  				numberOfMix = res.body.length;
	  				done();
	  			});
	  		});
	  	});


	  	describe("POST /mix to create the same mix", function(){
	  		it('/should return status code 403 and not create the mix', function(done){
	  			request(url)
	  			.post(mixAPI)
	  			.send(mix)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 403);
	  				done();
	  			});
	  		});
	  	});

	  	describe("GET /mix to fetch the number of mix", function(){
	  		it('should be the same number of mix because creation failed', function(done){
	  			request(url)
	  			.get(mixAPI)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, res.body.length === numberOfMix);
	  				done();
	  			});
	  		});
	  	});


	  	describe("PUT /mix to update a mix data", function(){
	  		it('should return status code 403 because only owner can update mix', function(done){
	  			request(url)
	  			.put(mixAPI)
	  			.send({owner:"toto", name: mix.name})
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 403);
	  				done();
	  			});
	  		});
	  	});

	  	describe("PUT /mix to update a mix data", function(){
	  		it('should return status code 201 because the owner can update his mix', function(done){
	  			request(url)
	  			.put(mixAPI)
	  			.send({owner: mix.owner, name: mix.name, data: "newData"})
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 201);
	  				done();
	  			});
	  		});
	  	});

	  	describe("DELETE /mix to delete a mix", function(){
	  		it('should return status code 403 because only owner can delete his mix', function(done){
	  			request(url)
	  			.delete(mixAPI+"/"+mix.name+"/toto")
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 403);
	  				done();
	  			});
	  		});
	  	});


	  	describe("DELETE /mix to delete a mix", function(){
	  		it('should return status code 200 because the owner deleted his mix', function(done){
	  			request(url)
	  			.delete(mixAPI+"/"+mix.name+"/"+mix.owner)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				done();
	  			});
	  		});
	  	});
	});

//********************  ADVANCED TESTS FOR STARS *************************//
	describe("Stars tests", function(){

		var totalStars = 0;
		var totalStarsForAmix = 0;
		var totalStarsForAmixByUser = 0;
		var starScoreUpdate = 5;

		describe("GET /star to fetch the number of star", function(){
	  		it('should retrieve star number in database', function(done){
	  			request(url)
	  			.get(starAPI)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				totalStars = res.body.length;
	  				done();
	  			});
	  		});
	  	});
	  	describe("GET /star/mixname to fetch the number of star for a mix", function(){
	  		it('should retrieve star number in database for a mix', function(done){
	  			request(url)
	  			.get(starAPI+"/"+star.mixName)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				totalStarsForAmix = res.body.length;
	  				done();
	  			});
	  		});
	  	});
	  	describe("GET /star/mixName/userName to fetch the number of star for a mix for a user", function(){
	  		it('should retrieve star number in database', function(done){
	  			request(url)
	  			.get(starAPI+"/"+star.mixName+"/"+star.userName)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				totalStarsForAmixByUser = res.body.length;
	  				done();
	  			});
	  		});
	  	});

	  	describe("POST /star to create a star", function(){
	  		it('/should create a new star raw an check if the number of mix has changed', function(done){
	  			request(url)
	  			.post(starAPI)
	  			.send(star)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 201);
	  				done();
	  			});
	  		});
	  	});

	  	describe("GET /star to fetch the number of star", function(){
	  		it('should increase by one', function(done){
	  			request(url)
	  			.get(starAPI)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, totalStars+1 === res.body.length);
	  				done();
	  			});
	  		});
	  	});
	  	describe("GET /star/mixname to fetch the number of star for a mix", function(){
	  		it('should increase by one', function(done){
	  			request(url)
	  			.get(starAPI+"/"+star.mixName)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, totalStarsForAmix+1 === res.body.length);
	  				done();
	  			});
	  		});
	  	});
	  	describe("GET /star/mixName/userName to fetch the number of star for a mix for a user", function(){
	  		it('should increase by one', function(done){
	  			request(url)
	  			.get(starAPI+"/"+star.mixName+"/"+star.userName)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, totalStarsForAmixByUser+1 === res.body.length);
	  				done();
	  			});
	  		});
	  	});
	  	describe("POST /star to create the same star", function(){
	  		it('/should return status code 403 because already exists', function(done){
	  			request(url)
	  			.post(starAPI)
	  			.send(star)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 403);
	  				done();
	  			});
	  		});
	  	});
	  	describe("PUT /star to update a star score", function(){
	  		it('/should return status code 201', function(done){
	  			star.star = starScoreUpdate;
	  			request(url)
	  			.post(starAPI)
	  			.send(star)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 403);
	  				done();
	  			});
	  		});
	  	});
	  	describe("GET /star/mixName/userName to check the update", function(){
	  		it('/should return status code 200 and star with star = 5', function(done){
	  			request(url)
	  			.get(starAPI+"/"+star.mixName+"/"+star.userName)
	  			.end(function(err, res){
	  				assert.equal(res.statusCode, 200);
	  				assert(true, res.body.star === starScoreUpdate);
	  				done();
	  			});
	  		});
	  	});
	});

	after(function(done){
		Star.remove({mixName: "testmocha"}, function(err){console.log(err);});
		done();
  	});
});
