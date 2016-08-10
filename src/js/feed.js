var feed, config;

config = {
    clientID: '8ae6c35f38634fbbac2278fd90ca3631',
    accessToken: '10295251.8ae6c35.fce720fb2265433293e4a550a943cecf',
    endpoint: 'https://api.instagram.com/v1/users/176412031/media/recent/',
    count: 6
};

feed = {
    init: function(el) {
        var request, URL;

        if (!el) {
            return;
        }

        URL = config.endpoint + '?access_token=' + config.accessToken;
        URL += '&count=' + config.count;
        URL += '&callback=onFeedFetchSuccess';

        this.el = el;

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
        this.el.appendChild(el);
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
