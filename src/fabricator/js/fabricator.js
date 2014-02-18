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
	menuItems: document.querySelectorAll(".f-menu li a"),
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
		color = chips[i].querySelector(".f-color-chip__color").innerHTML;
		chips[i].style.borderTopColor = color;
	}

	return this;

};


/**
 * Add `f-active` class to active menu item
 */
fabricator.setActiveItem = function () {
	// TODO

	// create a hash table for menu items

	// create array of "ids"
	// get the "id" in the url
	// get the index of the url id in teh array if ids
	// set that menuItem active


	/**
	 * @return {Array} Sorted array of menu item "ids"
	 */
	var parsedItems = function () {

		var items = [],
			id, href;

		for (var i = fabricator.dom.menuItems.length - 1; i >= 0; i--) {

			// remove active class from items
			fabricator.dom.menuItems[i].classList.remove("f-active");

			// get item href
			href = fabricator.dom.menuItems[i].getAttribute("href");

			// get id
			if (href.indexOf("#") > -1) {
				id = href.split("#").pop();
			} else {
				id = href.split("/").pop().replace(/\.[^/.]+$/, "");
			}

			items.push(id);

		}

		return items.reverse();

	};


	/**
	 * Match the "id" in the window location with the menu item, set menu item as active
	 */
	var setActive = function () {

		var href = window.location.href,
			items = parsedItems(),
			id, index;

		// get window "id"
		if (href.indexOf("#") > -1) {
			id = window.location.hash.replace("#", "");
		} else {
			id = window.location.pathname.split("/").pop().replace(/\.[^/.]+$/, "");
		}

		// find the window id in the items array
		index = items.indexOf(id);

		// set the matched item as active
		fabricator.dom.menuItems[index].classList.add("f-active");

	};

	window.addEventListener("hashchange", setActive);

	setActive();

	return this;

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
	var closeMenu = function () {
			toggleClasses();
		};

	for (var i = 0; i < fabricator.dom.menuItems.length; i++) {
		fabricator.dom.menuItems[i].addEventListener("click", closeMenu);
	}

	return this;

};

/**
 * Handler for preview and code toggles
 * @return {Object} fabricator
 */
fabricator.toggles.itemData = function () {

	var items = document.querySelectorAll(".f-item-group"),
		itemToggleSingle = document.querySelectorAll(".f-toggle"),
		itemToggleAll = document.querySelectorAll(".f-controls [data-toggle]");


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
	var toggleAll = function (target) {

		var toggle = target.getAttribute("data-toggle");

		target.classList.toggle("f-active");

		for (var i = 0; i < items.length; i++) {
			if (target.className.indexOf("f-active") > -1) {
				items[i].classList.add("f-item-" + toggle + "-active");
			} else {
				items[i].classList.remove("f-item-" + toggle + "-active");
			}
		}

	};

	for (var ii = 0; ii < itemToggleAll.length; ii++) {
		itemToggleAll[ii].addEventListener("click", function (e) {
			toggleAll(e.target);
		});
	}

	// set "preview" as active by default
	var previewAll = document.querySelector(".f-controls [data-toggle='preview']");
	toggleAll(previewAll);

	return this;

};


////////////////////////////////////////////////////////
// Init
////////////////////////////////////////////////////////
(function () {

	// attach toggle handlers
	fabricator.toggles
		.primaryMenu()
		.itemData();

	fabricator.buildColorChips()
		.setActiveItem();

	// if prototype page, template accordingly
	if (fabricator.dom.prototype && location.hash) {
		fabricator.templatePrototype(location.hash.replace(/#/, ""));
	}

	// syntax highlighting
	Prism.highlightAll();

}());