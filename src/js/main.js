'use strict';

var slider = require('./slider'),
    nav = require('./nav');

var app = {

    init: function() {
        slider.init();
        nav.init(document.querySelector('.site-nav'));
    }

};

app.init();

