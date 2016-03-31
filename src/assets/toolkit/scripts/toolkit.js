/**
 * Toolkit JavaScript
 */

// 'use strict';
var $ = require('jQuery'),
		_ = require('Underscore'),
		accordion = require('./modules/accordion');


if($('.accordion').length) {
	$('.accordion').each(function() {
		new accordion($(this));
	})
}
