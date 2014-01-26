"use strict";

// modules
var express = require("express"),
	app = express(),
	engines = require("consolidate"),
	fs = require("fs"),
	Handlebars = require("handlebars");


// location of data file
var dataLocation = "src/assets/json/data.json";

// get data
var getData = function () {
	return JSON.parse(fs.readFileSync(dataLocation));
};


// register each partial with Handlebars
var partials = ["menu", "head", "scripts"];

var registerPartials = function (partials) {

	var html;

	for (var i = partials.length - 1; i >= 0; i--) {
		html = fs.readFileSync("src/views/partials/" + partials[i] + ".html", "utf-8");
		Handlebars.registerPartial(partials[i], html);
	}

};

registerPartials(partials);


// configure
app.configure(function () {

	// options
	app.set("port", process.env.PORT || 9000);
	app.engine("html", engines.handlebars);
	app.set("view engine", "html");
	app.set("views", __dirname + "/views");
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	// routes
	app.use(app.router);
	app.use("/assets", express.static(__dirname + "/assets"));
	app.use("/toolkit", express.static(__dirname + "/toolkit"));
	app.use("/bower_components", express.static(__dirname + "/bower_components"));

	// index
	app.get("/", function (req, res) {
		res.render("index", getData());
	});

	// views
	app.get("/:view", function (req, res) {
		res.render(req.params.view, getData(), function (err, html) {
			if (err) {
				res.end(500);
			} else {
				res.end(html);
			}
		});
	});

	// API: return data
	app.get("/data/get", function (req, res) {

		fs.readFile(dataLocation, function (err, data) {
			res.end(data);
		});

	});

});

// start server
app.listen(app.get("port"), function () {
	console.log("Listening on " + app.get("port"));
});

module.exports = app;