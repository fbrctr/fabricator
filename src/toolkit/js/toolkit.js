"use strict";

require.config({
	baseUrl: "../toolkit/js"
});

require([
	"modules/namespace",
	"modules/alert"
], function(toolkit) {


	return toolkit;

});
