'use strict';

var director = require('director');

var slider = require('./slider'),
    nav = require('./nav'),
    feed = require('./feed'),
    form = require('./form'),
    anchorScroll = require('./anchor-scroll');

var app = {

    init: function() {
        var routes, router, self = this;

        routes = {
            '/': this.home.bind(this),
            '/contact': this.contact.bind(this)
        };

        nav.init(document.querySelector('.site-nav'));

        router = director.Router(routes);
        router.init('/');
    },


    home: function() {
        this.load('home', function() {
            slider.init(document.querySelector('.hero'));
            anchorScroll.init(document.querySelector('.hero__scroll-anchor'));
            feed.init(document.querySelector('.pics'));
        });
    },

    contact: function() {
        this.load('contact', function() {
            form.init(document.querySelector('.contact-form'), 'contact-form');
        });
    },

    load: function(page, callback) {
        var request;

        callback = callback || function() {};
        request = new XMLHttpRequest();
        request.open('GET', './' + page + '.html');
        request.onload = this.onLoadSuccess.bind(this, request, callback);

        document.body.classList.add('is-loading');
        document.querySelector('.site-content').innerHTML = '';

        request.send();
        nav.hide();
    },

    onLoadSuccess: function(request, callback) {
        if (request.status !== 200) {
            this.onFetchError();
            return;
        }

        var fragment = document.createElement('div');
        fragment.innerHTML = request.responseText;
        fragment = fragment.querySelector('.site-content');

        document.body.classList.remove('is-loading');
        document.querySelector('.site-content').innerHTML = fragment.innerHTML;
        callback();
    }


};

app.init();

