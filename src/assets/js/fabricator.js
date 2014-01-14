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
fabricator.dom = {
	primaryMenu: document.querySelector(".f-menu"),
	menuBar: document.querySelector(".f-menu-bar"),
	menuToggle: document.querySelector(".f-menu-toggle"),
	container: document.querySelector(".f-container"),
	templates: {
		standard: document.querySelector("#f-template--standard"),
		prototype: document.querySelector("#f-template--prototype")
	}
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

	var template, source,
		prototypeName, content;

	// template prototype pages
	if (fabricator.dom.templates.prototype && location.hash) {

		source = fabricator.dom.templates.prototype;

		if (source) {

			// remove container
			fabricator.dom.container.parentNode.removeChild(fabricator.dom.container);

			// get template data
			template = Handlebars.compile(source.innerHTML);
			prototypeName = location.hash.replace(/#/, "");

			// find the corresponding template
			for (var i = fabricator.data.prototypes.length - 1; i >= 0; i--) {
				if (fabricator.data.prototypes[i].id === prototypeName) {
					content = fabricator.data.prototypes[i].content;
				}
			}

			// add content to page
			source.insertAdjacentHTML("afterend", template({ prototype: content }));

		}

	} else {

		// template the menu
		fabricator.getData("html", "inc/menu.html", function (data) {
			var template = Handlebars.compile(data);
			fabricator.dom.container.insertAdjacentHTML("beforebegin", template(fabricator.data));
		});

		// template the page
		source = fabricator.dom.templates.standard;

		if (source) {
			template = Handlebars.compile(source.innerHTML);
			source.insertAdjacentHTML("afterend", template(fabricator.data));
		}

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

	// shortcut menu DOM
	var toggle = fabricator.dom.menuToggle;

	// toggle classes on certain elements
	var toggleClasses = function () {
		document.querySelector("html").classList.toggle("state--menu-active");
		fabricator.dom.menuToggle.classList.toggle("f-icon-menu");
		fabricator.dom.menuToggle.classList.toggle("f-icon-close");
	};

	// toggle classes on click
	toggle.addEventListener("click", function () {
		toggleClasses();
	});

	// close menu when clicking on item (for collapsed menu view)
	var menuItems = document.querySelectorAll(".f-menu li a"),
		closeMenu = function () {
			toggleClasses();
		};

	for (var i = 0; i < menuItems.length; i++) {
		menuItems[i].addEventListener("click", closeMenu);
	}

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


/**
 * Augment string prototype
 */
String.prototype.toTitleCase = function () {
	var str = this.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1);
	});
	return str.replace(/([A-Z])/g, " $1");
};

String.prototype.toDashDelimited = function () {
	return this.replace(/([A-Z])/g, "-$1").toLowerCase();
};


////////////////////////////////////////////////////////
// Init
////////////////////////////////////////////////////////
fabricator.getData("json", "assets/json/data.json", function (data) {

	fabricator.data = data;

	// template
	fabricator.template();

	fabricator.toggles
		.primaryMenu()
		.items();

	// init syntax highlighting
	Prism.highlightAll();

});
