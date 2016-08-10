'use strict';

var nav = {
    init: function(el) {
        this.el = el;
        this.button = el.querySelector('.site-nav__toggle');
        this.menu = el.querySelector('.site-nav__items');
        this.bind();
    },

    bind: function() {
        this.button.addEventListener('click', this.toggle.bind(this));
    },

    toggle: function() {
        this.el.classList.toggle('site-nav--visible');
        document.body.classList.toggle('has-open-menu');
    }
};

module.exports = nav;
