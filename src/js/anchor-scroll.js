'use strict';

var jump = require('jump.js');

var anchorScroll = {
    init: function(el) {
        if (!el) {
            return;
        }

        this.el = el;
        this.target = this.targetFromHREF(el.href);
        this.bind();
    },

    bind: function() {
        this.el.addEventListener('click', this.onAnchorClick.bind(this));
    },

    targetFromHREF: function(href) {
        href = href.split('#');

        return '#' + href[1];
    },

    onAnchorClick: function(event) {
        var target;

        event.preventDefault();

        jump(this.target);
    },
};

module.exports = anchorScroll;
