'use strict';

var Validatinator = require('validatinator');

var form = {
    init: function(el, formName) {
        var configs = {};

        if (!el) {
            return;
        }

        this.el = el;
        this.messageEl = el.querySelector('.form-message');
        this.name = formName;

        configs[formName] = {
            'first-name': 'required|alpha',
            'last-name': 'required|alpha',
            'email': 'required|email',
            'message': 'required'
        };

        this.validator = new Validatinator(configs);
        this.bind();
    },

    bind: function() {
        this.el.addEventListener('submit', this.onSubmit.bind(this));
    },

    onSubmit: function(event) {
        event.preventDefault();

        if (this.validator.fails(this.name)) {
            this.onError(this.validator.validationInformation[this.name],
                         this.validator.errors[this.name]);
            return;
        }

        this.onSuccess();
    },

    onError: function(fields, errors) {
        var field, fieldEl;

        for (field in fields) {
            if (!fields.hasOwnProperty(field)) {
                continue;
            }

            fieldEl = document.querySelector('[name=' + field + ']');
            fieldEl = fieldEl.parentNode;

            if (errors[field]) {
                fieldEl.classList.add('contact-form__label--invalid');
                fieldEl.classList.remove('contact-form__label--valid');
            } else {
                fieldEl.classList.remove('contact-form__label--invalid');
                fieldEl.classList.add('contact-form__label--valid');
            }
        }

        this.el.classList.add('contact-form--invalid');
    },

    onSuccess: function() {
        this.el.classList.remove('contact-form--invalid');
        this.el.classList.add('contact-form--valid');

        this.el.removeChild(this.el.querySelector('.contact-form__container'));
    }

};

module.exports = form;
