'use strict';

var slider = require('./slider'),
    nav = require('./nav'),
    feed = require('./feed'),
    form = require('./form'),
    anchorScroll = require('./anchor-scroll');

var app = {

    init: function() {
        slider.init(document.querySelector('.hero'));
        nav.init(document.querySelector('.site-nav'));
        anchorScroll.init(document.querySelector('.hero__scroll-anchor'));
        feed.init(document.querySelector('.pics'));
        form.init(document.querySelector('.contact-form'), 'contact-form');
    }

};

app.init();

