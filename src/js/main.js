'use strict';

var slider = require('./slider'),
    nav = require('./nav'),
    feed = require('./feed'),
    anchorScroll = require('./anchor-scroll');

var app = {

    init: function() {
        slider.init();
        nav.init(document.querySelector('.site-nav'));
        anchorScroll.init(document.querySelector('.hero__scroll-anchor'));
        feed.init();
    }

};

app.init();

