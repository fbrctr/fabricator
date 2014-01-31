"use strict";

/**
 * Global `fabricator` object
 * @namespace
 */
var fabricator = window.fabricator = {};


/**
 * Cache DOM
 * @type {Object}
 */
fabricator.dom = {
	primaryMenu: document.querySelector(".f-menu"),
	menuBar: document.querySelector(".f-menu-bar"),
	menuToggle: document.querySelector(".f-menu-toggle"),
	container: document.querySelector(".f-container"),
	prototype: document.getElementById("prototype")
};


/**
 * AJAX call for JSON
 * @param  {Function} callback
 * @return {Object} fabricator
 */
fabricator.getData = function (callback) {

	var url = "assets/json/data.json",
		data;

	// get data
	var getData = new XMLHttpRequest();
	getData.open("GET", url, false);
	getData.send();

	data = JSON.parse(getData.responseText);

	// send data to callback
	if (typeof callback === "function") {
		callback(data);
	}

	return this;

};


/**
 * Build color chips
 */
fabricator.buildColorChips = function () {

	var chips = document.querySelectorAll(".f-color-chip"),
		color;

	for (var i = chips.length - 1; i >= 0; i--) {
		color = chips[i].getAttribute("data-color");
		chips[i].style.borderTopColor = color;
	}

};


/**
 * Inject prototype content into page
 * @param  {String} id prototype identifier
 * @return {Object} fabricator
 */
fabricator.templatePrototype = function (id) {

	var content;

	// get data
	this.getData(function (data) {
		for (var i = data.prototypes.length - 1; i >= 0; i--) {
			if (data.prototypes[i].id === id) {
				content = data.prototypes[i].content;
				fabricator.dom.prototype.innerHTML = content;
			}
		}

	});

	return this;

};


/**
 * Toggle handlers
 * @type {Object}
 */
fabricator.toggles = {};

/**
 * Click handler to primary menu toggle
 * @return {Object} fabricator
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
 * @return {Object} fabricator
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
(function () {

	// attach toggle handlers
	fabricator.toggles
		.primaryMenu()
		.items();

	fabricator.buildColorChips();

	// if prototype page, template accordingly
	if (fabricator.dom.prototype && location.hash) {
		fabricator.templatePrototype(location.hash.replace(/#/, ""));
	}

	// syntax highlighting
	Prism.highlightAll();

}());