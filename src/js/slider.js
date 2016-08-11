'use strict';

var lory = require('lory.js').lory;

var slider = {
    init: function(el) {
        var frame;

        if (!el) {
            return;
        }

        this.el = el;
        this.lastScroll = Date.now();

        frame = el.querySelector('.hero__slider');
        frame.className += ' hero__slider--active';

        el.style.height = window.innerHeight + 'px';

        lory(el, {
            infinite: 1,
            classNameFrame: 'hero__slider',
            classNameSlideContainer: 'cases',
            classNamePrevCtrl: 'slider-nav__button--previous ',
            classNameNextCtrl: 'slider-nav__button--next '
        });
    },

    bind: function() {
        window.addEventListener('resize', this.onResize.bind(this));
    },

    onResize: function(event) {
        var current = Date.now();

        if (current - this.lastResize < 100) {
            return;
        }

        this.lastResize = current;
        this.el.style.height = window.innerHeight + 'px';
    }
};

module.exports = slider;
