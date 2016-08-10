(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * Jump.js 1.0.1 - A small, modern, dependency-free smooth scrolling library.
 * Copyright (c) 2016 Michael Cavalea - https://github.com/callmecavs/jump.js
 * License: MIT
 */

!function(o,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):o.Jump=n()}(this,function(){"use strict";var o=function(o,n,e,t){return o/=t/2,o<1?e/2*o*o+n:(o--,-e/2*(o*(o-2)-1)+n)},n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol?"symbol":typeof o},e=function(){function e(){return window.scrollY||window.pageYOffset}function t(o){return o.getBoundingClientRect().top+d}function i(o){v||(v=o),b=o-v,p=s(b,d,y,m),window.scrollTo(0,p),b<m?requestAnimationFrame(i):r()}function r(){window.scrollTo(0,d+y),c&&l&&(c.setAttribute("tabindex","-1"),c.focus()),"function"==typeof w&&w(),v=!1}function u(r){var u=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];switch(m=u.duration||1e3,a=u.offset||0,w=u.callback,s=u.easing||o,l=u.a11y||!1,d=e(),"undefined"==typeof r?"undefined":n(r)){case"number":c=void 0,l=!1,f=d+r;break;case"object":c=r,f=t(c);break;case"string":c=document.querySelector(r),f=t(c)}switch(y=f-d+a,n(u.duration)){case"number":m=u.duration;break;case"function":m=u.duration(y)}requestAnimationFrame(i)}var c=void 0,d=void 0,f=void 0,a=void 0,s=void 0,l=void 0,y=void 0,m=void 0,v=void 0,b=void 0,p=void 0,w=void 0;return u},t=e();return t});
},{}],2:[function(require,module,exports){
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* globals jQuery */

	exports.lory = lory;

	var _detectPrefixes = __webpack_require__(2);

	var _detectPrefixes2 = _interopRequireDefault(_detectPrefixes);

	var _dispatchEvent = __webpack_require__(3);

	var _dispatchEvent2 = _interopRequireDefault(_dispatchEvent);

	var _defaults = __webpack_require__(5);

	var _defaults2 = _interopRequireDefault(_defaults);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var slice = Array.prototype.slice;

	function lory(slider, opts) {
	    var position = void 0;
	    var slidesWidth = void 0;
	    var frameWidth = void 0;
	    var slides = void 0;

	    /**
	     * slider DOM elements
	     */
	    var frame = void 0;
	    var slideContainer = void 0;
	    var prevCtrl = void 0;
	    var nextCtrl = void 0;
	    var prefixes = void 0;
	    var transitionEndCallback = void 0;

	    var index = 0;
	    var options = {};

	    /**
	     * if object is jQuery convert to native DOM element
	     */
	    if (typeof jQuery !== 'undefined' && slider instanceof jQuery) {
	        slider = slider[0];
	    }

	    /**
	     * private
	     * set active class to element which is the current slide
	     */
	    function setActiveElement(slides, currentIndex) {
	        var _options = options;
	        var classNameActiveSlide = _options.classNameActiveSlide;


	        slides.forEach(function (element, index) {
	            if (element.classList.contains(classNameActiveSlide)) {
	                element.classList.remove(classNameActiveSlide);
	            }
	        });

	        slides[currentIndex].classList.add(classNameActiveSlide);
	    }

	    /**
	     * private
	     * setupInfinite: function to setup if infinite is set
	     *
	     * @param  {array} slideArray
	     * @return {array} array of updated slideContainer elements
	     */
	    function setupInfinite(slideArray) {
	        var _options2 = options;
	        var infinite = _options2.infinite;


	        var front = slideArray.slice(0, infinite);
	        var back = slideArray.slice(slideArray.length - infinite, slideArray.length);

	        front.forEach(function (element) {
	            var cloned = element.cloneNode(true);

	            slideContainer.appendChild(cloned);
	        });

	        back.reverse().forEach(function (element) {
	            var cloned = element.cloneNode(true);

	            slideContainer.insertBefore(cloned, slideContainer.firstChild);
	        });

	        slideContainer.addEventListener(prefixes.transitionEnd, onTransitionEnd);

	        return slice.call(slideContainer.children);
	    }

	    /**
	     * [dispatchSliderEvent description]
	     * @return {[type]} [description]
	     */
	    function dispatchSliderEvent(phase, type, detail) {
	        (0, _dispatchEvent2.default)(slider, phase + '.lory.' + type, detail);
	    }

	    /**
	     * translates to a given position in a given time in milliseconds
	     *
	     * @to        {number} number in pixels where to translate to
	     * @duration  {number} time in milliseconds for the transistion
	     * @ease      {string} easing css property
	     */
	    function translate(to, duration, ease) {
	        var style = slideContainer && slideContainer.style;

	        if (style) {
	            style[prefixes.transition + 'TimingFunction'] = ease;
	            style[prefixes.transition + 'Duration'] = duration + 'ms';

	            if (prefixes.hasTranslate3d) {
	                style[prefixes.transform] = 'translate3d(' + to + 'px, 0, 0)';
	            } else {
	                style[prefixes.transform] = 'translate(' + to + 'px, 0)';
	            }
	        }
	    }

	    /**
	     * slidefunction called by prev, next & touchend
	     *
	     * determine nextIndex and slide to next postion
	     * under restrictions of the defined options
	     *
	     * @direction  {boolean}
	     */
	    function slide(nextIndex, direction) {
	        var _options3 = options;
	        var slideSpeed = _options3.slideSpeed;
	        var slidesToScroll = _options3.slidesToScroll;
	        var infinite = _options3.infinite;
	        var rewind = _options3.rewind;
	        var rewindSpeed = _options3.rewindSpeed;
	        var ease = _options3.ease;
	        var classNameActiveSlide = _options3.classNameActiveSlide;


	        var duration = slideSpeed;

	        var nextSlide = direction ? index + 1 : index - 1;
	        var maxOffset = Math.round(slidesWidth - frameWidth);

	        dispatchSliderEvent('before', 'slide', {
	            index: index,
	            nextSlide: nextSlide
	        });

	        if (typeof nextIndex !== 'number') {
	            if (direction) {
	                nextIndex = index + slidesToScroll;
	            } else {
	                nextIndex = index - slidesToScroll;
	            }
	        }

	        nextIndex = Math.min(Math.max(nextIndex, 0), slides.length - 1);

	        if (infinite && direction === undefined) {
	            nextIndex += infinite;
	        }

	        var nextOffset = Math.min(Math.max(slides[nextIndex].offsetLeft * -1, maxOffset * -1), 0);

	        if (rewind && Math.abs(position.x) === maxOffset && direction) {
	            nextOffset = 0;
	            nextIndex = 0;
	            duration = rewindSpeed;
	        }

	        /**
	         * translate to the nextOffset by a defined duration and ease function
	         */
	        translate(nextOffset, duration, ease);

	        /**
	         * update the position with the next position
	         */
	        position.x = nextOffset;

	        /**
	         * update the index with the nextIndex only if
	         * the offset of the nextIndex is in the range of the maxOffset
	         */
	        if (slides[nextIndex].offsetLeft <= maxOffset) {
	            index = nextIndex;
	        }

	        if (infinite && (Math.abs(nextOffset) === maxOffset || Math.abs(nextOffset) === 0)) {
	            if (direction) {
	                index = infinite;
	            }

	            if (!direction) {
	                index = slides.length - infinite * 2;
	            }

	            position.x = slides[index].offsetLeft * -1;

	            transitionEndCallback = function transitionEndCallback() {
	                translate(slides[index].offsetLeft * -1, 0, undefined);
	            };
	        }

	        if (classNameActiveSlide) {
	            setActiveElement(slice.call(slides), index);
	        }

	        dispatchSliderEvent('after', 'slide', {
	            currentSlide: index
	        });
	    }

	    /**
	     * public
	     * setup function
	     */
	    function setup() {
	        dispatchSliderEvent('before', 'init');

	        prefixes = (0, _detectPrefixes2.default)();
	        options = _extends({}, _defaults2.default, opts);

	        var _options4 = options;
	        var classNameFrame = _options4.classNameFrame;
	        var classNameSlideContainer = _options4.classNameSlideContainer;
	        var classNamePrevCtrl = _options4.classNamePrevCtrl;
	        var classNameNextCtrl = _options4.classNameNextCtrl;
	        var enableMouseEvents = _options4.enableMouseEvents;
	        var classNameActiveSlide = _options4.classNameActiveSlide;


	        frame = slider.getElementsByClassName(classNameFrame)[0];
	        slideContainer = frame.getElementsByClassName(classNameSlideContainer)[0];
	        prevCtrl = slider.getElementsByClassName(classNamePrevCtrl)[0];
	        nextCtrl = slider.getElementsByClassName(classNameNextCtrl)[0];

	        position = {
	            x: slideContainer.offsetLeft,
	            y: slideContainer.offsetTop
	        };

	        if (options.infinite) {
	            slides = setupInfinite(slice.call(slideContainer.children));
	        } else {
	            slides = slice.call(slideContainer.children);
	        }

	        reset();

	        if (classNameActiveSlide) {
	            setActiveElement(slides, index);
	        }

	        if (prevCtrl && nextCtrl) {
	            prevCtrl.addEventListener('click', prev);
	            nextCtrl.addEventListener('click', next);
	        }

	        slideContainer.addEventListener('touchstart', onTouchstart);

	        if (enableMouseEvents) {
	            slideContainer.addEventListener('mousedown', onTouchstart);
	            slideContainer.addEventListener('click', onClick);
	        }

	        options.window.addEventListener('resize', onResize);

	        dispatchSliderEvent('after', 'init');
	    }

	    /**
	     * public
	     * reset function: called on resize
	     */
	    function reset() {
	        var _options5 = options;
	        var infinite = _options5.infinite;
	        var ease = _options5.ease;
	        var rewindSpeed = _options5.rewindSpeed;


	        slidesWidth = slideContainer.getBoundingClientRect().width || slideContainer.offsetWidth;
	        frameWidth = frame.getBoundingClientRect().width || frame.offsetWidth;

	        if (frameWidth === slidesWidth) {
	            slidesWidth = slides.reduce(function (previousValue, slide) {
	                return previousValue + slide.getBoundingClientRect().width || slide.offsetWidth;
	            }, 0);
	        }

	        index = 0;

	        if (infinite) {
	            translate(slides[index + infinite].offsetLeft * -1, 0, null);

	            index = index + infinite;
	            position.x = slides[index].offsetLeft * -1;
	        } else {
	            translate(0, rewindSpeed, ease);
	        }
	    }

	    /**
	     * public
	     * slideTo: called on clickhandler
	     */
	    function slideTo(index) {
	        slide(index);
	    }

	    /**
	     * public
	     * returnIndex function: called on clickhandler
	     */
	    function returnIndex() {
	        return index - options.infinite || 0;
	    }

	    /**
	     * public
	     * prev function: called on clickhandler
	     */
	    function prev() {
	        slide(false, false);
	    }

	    /**
	     * public
	     * next function: called on clickhandler
	     */
	    function next() {
	        slide(false, true);
	    }

	    /**
	     * public
	     * destroy function: called to gracefully destroy the lory instance
	     */
	    function destroy() {
	        dispatchSliderEvent('before', 'destroy');

	        // remove event listeners
	        slideContainer.removeEventListener(prefixes.transitionEnd, onTransitionEnd);
	        slideContainer.removeEventListener('touchstart', onTouchstart);
	        slideContainer.removeEventListener('touchmove', onTouchmove);
	        slideContainer.removeEventListener('touchend', onTouchend);
	        slideContainer.removeEventListener('mousemove', onTouchmove);
	        slideContainer.removeEventListener('mousedown', onTouchstart);
	        slideContainer.removeEventListener('mouseup', onTouchend);
	        slideContainer.removeEventListener('mouseleave', onTouchend);
	        slideContainer.removeEventListener('click', onClick);

	        options.window.removeEventListener('resize', onResize);

	        if (prevCtrl) {
	            prevCtrl.removeEventListener('click', prev);
	        }

	        if (nextCtrl) {
	            nextCtrl.removeEventListener('click', next);
	        }

	        dispatchSliderEvent('after', 'destroy');
	    }

	    // event handling

	    var touchOffset = void 0;
	    var delta = void 0;
	    var isScrolling = void 0;

	    function onTransitionEnd() {
	        if (transitionEndCallback) {
	            transitionEndCallback();

	            transitionEndCallback = undefined;
	        }
	    }

	    function onTouchstart(event) {
	        var _options6 = options;
	        var enableMouseEvents = _options6.enableMouseEvents;

	        var touches = event.touches ? event.touches[0] : event;

	        if (enableMouseEvents) {
	            slideContainer.addEventListener('mousemove', onTouchmove);
	            slideContainer.addEventListener('mouseup', onTouchend);
	            slideContainer.addEventListener('mouseleave', onTouchend);
	        }

	        slideContainer.addEventListener('touchmove', onTouchmove);
	        slideContainer.addEventListener('touchend', onTouchend);

	        var pageX = touches.pageX;
	        var pageY = touches.pageY;


	        touchOffset = {
	            x: pageX,
	            y: pageY,
	            time: Date.now()
	        };

	        isScrolling = undefined;

	        delta = {};

	        dispatchSliderEvent('on', 'touchstart', {
	            event: event
	        });
	    }

	    function onTouchmove(event) {
	        var touches = event.touches ? event.touches[0] : event;
	        var pageX = touches.pageX;
	        var pageY = touches.pageY;


	        delta = {
	            x: pageX - touchOffset.x,
	            y: pageY - touchOffset.y
	        };

	        if (typeof isScrolling === 'undefined') {
	            isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y));
	        }

	        if (!isScrolling && touchOffset) {
	            event.preventDefault();
	            translate(position.x + delta.x, 0, null);
	        }

	        // may be
	        dispatchSliderEvent('on', 'touchmove', {
	            event: event
	        });
	    }

	    function onTouchend(event) {
	        /**
	         * time between touchstart and touchend in milliseconds
	         * @duration {number}
	         */
	        var duration = touchOffset ? Date.now() - touchOffset.time : undefined;

	        /**
	         * is valid if:
	         *
	         * -> swipe attempt time is over 300 ms
	         * and
	         * -> swipe distance is greater than 25px
	         * or
	         * -> swipe distance is more then a third of the swipe area
	         *
	         * @isValidSlide {Boolean}
	         */
	        var isValid = Number(duration) < 300 && Math.abs(delta.x) > 25 || Math.abs(delta.x) > frameWidth / 3;

	        /**
	         * is out of bounds if:
	         *
	         * -> index is 0 and delta x is greater than 0
	         * or
	         * -> index is the last slide and delta is smaller than 0
	         *
	         * @isOutOfBounds {Boolean}
	         */
	        var isOutOfBounds = !index && delta.x > 0 || index === slides.length - 1 && delta.x < 0;

	        var direction = delta.x < 0;

	        if (!isScrolling) {
	            if (isValid && !isOutOfBounds) {
	                slide(false, direction);
	            } else {
	                translate(position.x, options.snapBackSpeed);
	            }
	        }

	        touchOffset = undefined;

	        /**
	         * remove eventlisteners after swipe attempt
	         */
	        slideContainer.removeEventListener('touchmove', onTouchmove);
	        slideContainer.removeEventListener('touchend', onTouchend);
	        slideContainer.removeEventListener('mousemove', onTouchmove);
	        slideContainer.removeEventListener('mouseup', onTouchend);
	        slideContainer.removeEventListener('mouseleave', onTouchend);

	        dispatchSliderEvent('on', 'touchend', {
	            event: event
	        });
	    }

	    function onClick(event) {
	        if (delta.x) {
	            event.preventDefault();
	        }
	    }

	    function onResize(event) {
	        reset();

	        dispatchSliderEvent('on', 'resize', {
	            event: event
	        });
	    }

	    // trigger initial setup
	    setup();

	    // expose public api
	    return {
	        setup: setup,
	        reset: reset,
	        slideTo: slideTo,
	        returnIndex: returnIndex,
	        prev: prev,
	        next: next,
	        destroy: destroy
	    };
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = detectPrefixes;
	/**
	 * Detecting prefixes for saving time and bytes
	 */
	function detectPrefixes() {
	    var transform = void 0;
	    var transition = void 0;
	    var transitionEnd = void 0;
	    var hasTranslate3d = void 0;

	    (function () {
	        var el = document.createElement('_');
	        var style = el.style;

	        var prop = void 0;

	        if (style[prop = 'webkitTransition'] === '') {
	            transitionEnd = 'webkitTransitionEnd';
	            transition = prop;
	        }

	        if (style[prop = 'transition'] === '') {
	            transitionEnd = 'transitionend';
	            transition = prop;
	        }

	        if (style[prop = 'webkitTransform'] === '') {
	            transform = prop;
	        }

	        if (style[prop = 'msTransform'] === '') {
	            transform = prop;
	        }

	        if (style[prop = 'transform'] === '') {
	            transform = prop;
	        }

	        document.body.insertBefore(el, null);
	        style[transform] = 'translate3d(0, 0, 0)';
	        hasTranslate3d = !!global.getComputedStyle(el).getPropertyValue(transform);
	        document.body.removeChild(el);
	    })();

	    return {
	        transform: transform,
	        transition: transition,
	        transitionEnd: transitionEnd,
	        hasTranslate3d: hasTranslate3d
	    };
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = dispatchEvent;

	var _customEvent = __webpack_require__(4);

	var _customEvent2 = _interopRequireDefault(_customEvent);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * dispatch custom events
	 *
	 * @param  {element} el         slideshow element
	 * @param  {string}  type       custom event name
	 * @param  {object}  detail     custom detail information
	 */
	function dispatchEvent(target, type, detail) {
	    var event = new _customEvent2.default(type, {
	        bubbles: true,
	        cancelable: true,
	        detail: detail
	    });

	    target.dispatchEvent(event);
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {
	var NativeCustomEvent = global.CustomEvent;

	function useNative () {
	  try {
	    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
	    return  'cat' === p.type && 'bar' === p.detail.foo;
	  } catch (e) {
	  }
	  return false;
	}

	/**
	 * Cross-browser `CustomEvent` constructor.
	 *
	 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
	 *
	 * @public
	 */

	module.exports = useNative() ? NativeCustomEvent :

	// IE >= 9
	'function' === typeof document.createEvent ? function CustomEvent (type, params) {
	  var e = document.createEvent('CustomEvent');
	  if (params) {
	    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
	  } else {
	    e.initCustomEvent(type, false, false, void 0);
	  }
	  return e;
	} :

	// IE <= 8
	function CustomEvent (type, params) {
	  var e = document.createEventObject();
	  e.type = type;
	  if (params) {
	    e.bubbles = Boolean(params.bubbles);
	    e.cancelable = Boolean(params.cancelable);
	    e.detail = params.detail;
	  } else {
	    e.bubbles = false;
	    e.cancelable = false;
	    e.detail = void 0;
	  }
	  return e;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  /**
	   * slides scrolled at once
	   * @slidesToScroll {Number}
	   */
	  slidesToScroll: 1,

	  /**
	   * time in milliseconds for the animation of a valid slide attempt
	   * @slideSpeed {Number}
	   */
	  slideSpeed: 300,

	  /**
	   * time in milliseconds for the animation of the rewind after the last slide
	   * @rewindSpeed {Number}
	   */
	  rewindSpeed: 600,

	  /**
	   * time for the snapBack of the slider if the slide attempt was not valid
	   * @snapBackSpeed {Number}
	   */
	  snapBackSpeed: 200,

	  /**
	   * Basic easing functions: https://developer.mozilla.org/de/docs/Web/CSS/transition-timing-function
	   * cubic bezier easing functions: http://easings.net/de
	   * @ease {String}
	   */
	  ease: 'ease',

	  /**
	   * if slider reached the last slide, with next click the slider goes back to the startindex.
	   * use infinite or rewind, not both
	   * @rewind {Boolean}
	   */
	  rewind: false,

	  /**
	   * number of visible slides or false
	   * use infinite or rewind, not both
	   * @infinite {number}
	   */
	  infinite: false,

	  /**
	   * class name for slider frame
	   * @classNameFrame {string}
	   */
	  classNameFrame: 'js_frame',

	  /**
	   * class name for slides container
	   * @classNameSlideContainer {string}
	   */
	  classNameSlideContainer: 'js_slides',

	  /**
	   * class name for slider prev control
	   * @classNamePrevCtrl {string}
	   */
	  classNamePrevCtrl: 'js_prev',

	  /**
	   * class name for slider next control
	   * @classNameNextCtrl {string}
	   */
	  classNameNextCtrl: 'js_next',

	  /**
	   * class name for current active slide
	   * if emptyString then no class is set
	   * @classNameActiveSlide {string}
	   */
	  classNameActiveSlide: 'active',

	  /**
	   * enables mouse events for swiping on desktop devices
	   * @enableMouseEvents {boolean}
	   */
	  enableMouseEvents: false,

	  /**
	   * window instance
	   * @window {object}
	   */
	  window: window
	};

/***/ }
/******/ ])
});
;
},{}],3:[function(require,module,exports){
'use strict';

var jump = require('jump.js');

var anchorScroll = {
    init: function(el) {
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

},{"jump.js":1}],4:[function(require,module,exports){
var feed, config;

config = {
    clientID: '8ae6c35f38634fbbac2278fd90ca3631',
    accessToken: '10295251.8ae6c35.fce720fb2265433293e4a550a943cecf',
    endpoint: 'https://api.instagram.com/v1/users/176412031/media/recent/',
    count: 6
};

feed = {
    init: function() {
        var request, URL;
        URL = config.endpoint + '?access_token=' + config.accessToken;
        URL += '&count=' + config.count;
        URL += '&callback=onFeedFetchSuccess';

        this.requestJSONP(URL);
    },

    requestJSONP: function(URL) {
        var el;

        el = document.createElement('script');
        el.src = URL;
        el.id = 'instagram-request';
        document.head.appendChild(el);
    },

    onFeedFetchSuccess: function(response) {
        var self = feed;

        if (response.meta.code !== 200) {
            self.onFeedFetchError(response.meta);
            return;
        }

        if (!response.data.length || response.data.length < 1) {
            return;
        }

        if (response.data.length === 2) {
            response.data.push(response.data[0]);
        }

        if (response.data.length === 1) {
            response.data.push(response.data[0]);
            response.data.push(response.data[0]);
        }

        self.parse(response.data);
    },

    onFeedFetchError: function(err) {
        console.warn(err);
    },

    parse: function(data) {
        var el;
        data = this.parsedData(data);
        el = this.template(data);
        this.render(el);
    },

    render: function(el) {
        document.querySelector('.pics').appendChild(el);
    },

    parsedData: function(data) {
        return data.map(this.simplifiedDatum);
    },

    simplifiedDatum: function(datum) {
        var caption, image;
        caption = datum.caption;
        image = datum.images;

        caption = caption ? caption.text : '';
        image = image.standard_resolution.url;

        return {
            text: caption,
            image: image
        };
    },

    template: function(photos) {
        var el, self;

        self = this;

        el = document.createElement('ol');
        el.className = 'pics__list';

        photos.forEach(function(photo) {
            el.appendChild(self.photoWithCaption(photo));
        });

        return el;
    },

    photoWithCaption: function(photo) {
        var el, figure;

        el = document.createElement('li');
        el.className = 'pic';

        figure = document.createElement('figure');
        figure.className = 'pic__figure';

        figure.appendChild(this.image(photo.image));
        figure.appendChild(this.caption(photo.text));

        el.appendChild(figure);

        return el;
    },

    image: function(image) {
        var img;
        img = document.createElement('img');
        img.className = 'pic__image';
        img.src = image;
        return img;
    },

    caption: function(text) {
        var caption, paragraph;
        paragraph = document.createElement('p');
        paragraph.innerHTML = text;

        caption = document.createElement('div');
        caption.className = 'pic__caption';
        caption.appendChild(paragraph);

        return caption;
    }

};

window.onFeedFetchSuccess = feed.onFeedFetchSuccess;

module.exports = feed;

},{}],5:[function(require,module,exports){
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


},{"./anchor-scroll":3,"./feed":4,"./nav":6,"./slider":7}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
'use strict';

var lory = require('lory.js').lory;

var slider = {
    init: function() {
        var el = document.querySelector('.hero'),
            frame = document.querySelector('.hero__slider');

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

},{"lory.js":2}]},{},[5]);
