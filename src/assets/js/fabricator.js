"use strict";

/**
 * Global `fabricator` object
 * @namespace
 */
var fabricator = window.fabricator = {};


/**
 * JSON data for page
 * @type {Object}
 */
fabricator.data = {};


/**
 * Cache DOM
 * @type {Object}
 */
fabricator.structures = {
	primaryMenu: document.querySelector(".f-menu"),
	menuBar: document.querySelector(".f-menu-bar"),
	menuToggle: document.querySelector(".f-menu-toggle"),
	main: document.querySelector("[role=main]")
};


/**
 * AJAX call for JSON
 * @param  {Function} callback
 */
fabricator.getData = function (type, url, callback) {

	var data;

	// get data
	var getData = new XMLHttpRequest();
	getData.open("GET", url, false);
	getData.send();

	if (type.toUpperCase() === "JSON") {
		data = JSON.parse(getData.responseText);
	}

	if (type.toUpperCase() === "HTML") {
		data = getData.responseText;
	}

	// send data to callback
	if (typeof callback === "function") {
		callback(data);
	}

	return this;

};


/**
 * Template the page
 */
fabricator.template = function () {

	// menu
	fabricator.getData("html", "inc/_menu.html", function (data) {
		// template
		var _tmpl = _.template(data);
		fabricator.structures.main.insertAdjacentHTML("afterend", _tmpl(fabricator.data));
	});


	// "main" template...if it exists
	var mainTemplate = document.querySelector("#f-template"),
		_tmpl;

	if (mainTemplate) {
		_tmpl = _.template(mainTemplate.innerHTML);
		mainTemplate.insertAdjacentHTML("afterend", _tmpl(fabricator.data));
	}


	return this;

};


/**
 * Toggle handlers
 * @type {Object}
 */
fabricator.toggles = {};

/**
 * Click handler to primary menu toggle
 */
fabricator.toggles.primaryMenu = function () {

	var toggle = fabricator.structures.menuToggle;

	toggle.addEventListener("click", function () {
		fabricator.structures.main.classList.toggle("state--active");
		fabricator.structures.menuToggle.classList.toggle("fa-bars");
		fabricator.structures.menuToggle.classList.toggle("fa-times");
	});

	return this;

};

/**
 * Handler for preview and code toggles
 */
fabricator.toggles.items = function () {

	var items = document.querySelectorAll(".f-item-group"),
		itemToggleSingle = document.querySelectorAll(".f-toggle"),
		itemToggleAll = document.querySelectorAll(".f-controls input");


	// toggle single
	var toggleItem = function () {
		var group = this.parentNode.parentNode.parentNode,
			toggle = this.attributes["data-toggle"].value;

		group.classList.toggle("f-item-" + toggle + "-active");
	};

	for (var i = 0; i < itemToggleSingle.length; i++) {
		itemToggleSingle[i].addEventListener("click", toggleItem);
	}


	// toggle all
	var toggleAll = function () {
		var toggle = this.attributes["data-toggle"].value;

		for (var i = 0; i < items.length; i++) {
			if (this.checked) {
				items[i].classList.add("f-item-" + toggle + "-active");
			} else {
				items[i].classList.remove("f-item-" + toggle + "-active");
			}
		}

	};

	for (var ii = 0; ii < itemToggleAll.length; ii++) {
		itemToggleAll[ii].addEventListener("change", toggleAll);
	}


	// open by default
	var changeEvent = document.createEvent("HTMLEvents");
	changeEvent.initEvent("change", true, true);

	var previewAll = document.querySelector(".f-controls input[data-toggle='preview']");

	if (previewAll) {
		previewAll.setAttribute("checked", true);
		previewAll.dispatchEvent(changeEvent);
	}

	return this;

};



////////////////////////////////////////////////////////
// Init
////////////////////////////////////////////////////////
fabricator.getData("json", "assets/json/data.json", function (data) {

	fabricator.data = data;

	// call functions
	fabricator.template();

	fabricator.toggles
		.primaryMenu()
		.items();

	// init syntax highlighting
	Prism.highlightAll();
});
