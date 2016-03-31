var express = require('express');
var router = express.Router();

var digits = "abcdefghijklmnopqrstuvwxyz";
var radix = digits.length;
//Convert base 26 to base 10
function alphaToDecCode(alphaCode) {
	var numDigits = alphaCode.length;
	var result = 0;
	for(var i = 0; i < alphaCode.length; i++) {
		numDigits--;
		if(numDigits == 0) {
			result += 1;
		}
		else
			result += parseInt(alphaCode.charAt(i), radix) * radix * numDigits;
	}
	return result;
}
//This should work for converting base 10 to base 26
function decToAlphaCode(decCode) {
    var result = "";
    do {
   		result = digits[decCode % radix] + result;
    	decCode = Math.floor(decCode / radix);
    } while (decCode > 0);
	return result;
}

/* GET Shortur Home Page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Shortur' });
});

/* POST Long Form URL */
router.post('/addURL', function(req, res) {
	//Add url to DB
	var db = req.db;
	var collection = db.get('URLdb');
	collection.insert({
		"_id" : Math.floor(new Date() / 1000),
		"longURL" : req.data,
		"accessCount" : 0}, 
		function (err, doc) {
			if (err) {
            	res.send("There was a problem adding the information to the database.");
			}
        	else {
				// Shorten the URL here, then send it as a response.
				console.log("This is the ID we have stored under: " + doc._id);
				var alphaCode = decToAlphaCode(doc._id);
				res.send("localhost:3000/t/" + alphaCode);
			}
		});
});
/* GET Short Form URL and REDIRECT to Long Form URL */
router.get('/t/*', function(req, res) {
	var db = req.db;
	var collection = db.get('URLdb');
	var url = req.url.substring(3);
	var id = alphaToDecCode(url);
	console.log("This is the ID to be looked up: " + id);
	collection.find(
		{ "_id" : id },
		function(err, doc) {
			if(err) {
				res.send("There was a problem finding or reading information from the database");
			}
			else {
				console.log(doc.longURL);
				if(doc.longURL != "undefined")
					res.redirect(301, doc.longURL);
			}
		});
});

module.exports = router;