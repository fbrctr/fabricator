var $, jQuery = require('jQuery');
var _ = require('Underscore');

var Accordion = (function($, _) {
    'use strict';

    var def = function($el) {
        this.$el = $el;
        this.$toggle = $('.accordion-preview', $el);

        this.states = {
            active : 'is-active'
        };

        init.call(this);
    };

    var init = function() {
        this.bind();
    };

    def.prototype = {
        bind : function() {
            this.$toggle.on('click', _.bind(this.toggle, this));
        },
        toggle : function() {
            this.$el.toggleClass(this.states.active);
        }
    };

    return def;
}).call(this, jQuery, _);

module.exports = Accordion;