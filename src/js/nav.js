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
    },

    hide: function() {
        this.el.classList.remove('site-nav--visible');
        document.body.classList.remove('has-open-menu');
    },

    activateItem: function(item) {
        var currentActive = document.querySelector('.nav-item--active');

        if (currentActive) {
            currentActive.classList.remove('nav-item--active');
        }

        item.classList.add('nav-item--active');
    }
};

module.exports = nav;
