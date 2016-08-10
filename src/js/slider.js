'use strict';

var lory = require('lory.js').lory;

var slider = {
    init: function(el) {
        var frame;

        if (!el) {
            return;
        }

        frame = el.querySelector('.hero__slider');
        frame.className += ' hero__slider--active';

        lory(el, {
            infinite: 1,
            classNameFrame: 'hero__slider',
            classNameSlideContainer: 'cases',
            classNamePrevCtrl: 'slider-nav__button--previous ',
            classNameNextCtrl: 'slider-nav__button--next '
        });
    }
};

module.exports = slider;
