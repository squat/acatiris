/*jslint node: true*/
'use strict';

var express = require('express'),
    cheerio = require('cheerio'),
    _ = require('lodash'),
    Promise = require('es6-promise').Promise,
    http = require('http'),
    url = require('url');

/** Expose acatiris. */
var acatiris = module.exports = function(req, res) {
    var $ = cheerio.load(res.body),
        imgs = $('img').toArray();

    if (imgs.length) {
        return imgs.reduce(function(sequence, img) {
            return sequence.then(function() {
                return acatiris.convert($(img).attr('src')).then(function(out) {
                    $(img).replaceWith('<pre class="acatiris">' + out + '</pre>');
                });
            });
        }, Promise.resolve()).then(function() {
            return res.send($.html());
        });
    }
    return res.send(res.body);
};

/** Expose express on acatiris so it can be used as an ascii endpoint. */
acatiris.endpoint = express();

/** Expose jp2a and imagemagick on the module. */
acatiris.jp2a = require('jp2a');
acatiris.imagemagick = require( 'imagemagick-native' );

/** Create the defaults for the module. */
acatiris.defaults = {
    'background': 'light',
    'color': true,
    'fill': true,
    'html': true,
    'html-no-bold': true,
    'html-raw': true,
    'width': 150
};

/** Configure routes for the module. */
/** At root, simply render 'a cat iris'. */
acatiris.endpoint.get('/', function( req, res ) {
    return res.send('a cat iris');
});

/** At any other route, process the URL and render some ascii art. */
acatiris.endpoint.use(function(req, res) {
    var src = req.originalUrl.indexOf(acatiris.endpoint.mountpath) === 0 ? req.originalUrl.substr(acatiris.endpoint.mountpath.length + 1) : req.originalUrl;

    acatiris.convert(src).then(function(out) {
        /**
         * Define a callback for jp2a to execute when it finishes rendering the
         * image.
         *
         * Move the style element to the output element and remove extra
         * markup.
         */
        var $ = cheerio.load('<pre class="acatiris">' + out + '</pre>');
        out = $('.ascii').append($('style')).parent().html();

        /** Return the processed response. */
        return res.send($.html());
    }, function(error) {
        return res.status(500).send({error: error});
    });
});

/**
 * Convert an image into ASCII.
 * @param {string|object} src - A URL for the image we want to fetch or a hash
 * of conversion options including a src.
 * @return A promise object that resolves with the converted ASCII art.
 */
acatiris.convert = function(src) {
    var options = {},
        format;

    if (Object.prototype.toString.call(src) === '[object Object]') {
        options = src;
        src = options.src;
    }

    /**
     * Create a hash of conversion options using the acatiris.defaults object
     * as the default, followed by the querystring options, followed by any
     * options passed directly to the method. Validate these last two by only
     * picking properties present in the acatiris.defaults object.
     */
    options = _.extend({}, acatiris.defaults, _.pick(_.extend(url.parse(src, true).query, options), _.keys(acatiris.defaults)));

    return new Promise(function(resolve, reject) {
        return acatiris.fetch(src).then(function(data) {
            data = new Buffer(data, 'binary');
            format = acatiris.identify(data);
            /** Check if the identification succeeded, otherwise return an error. */
            if (format) {
                if (format !== 'JPEG') {
                    data = acatiris.imagemagick.convert({format: 'JPEG', srcData: data});
                }
                options.data = data.toString('binary');

                return acatiris.jp2a(options, function(out) {
                    resolve(out);
                });
            }
            return reject('Unrecognized image format');
        }, function(error) {
            return reject(error);
        });
    });
};

/**
 * Fetch an image so that the output can be piped into jp2a or imagemagick.
 * @param {string} url - A URL for the image we want to fetch.
 * @return A promise object that resolves with the fetched data as a binary
 * string.
 */
acatiris.fetch = function(url) {
    /**
     * If no parameter is supplied or if the parameter is not a string, throw an
     * error.
     */
    if (!url || Object.prototype.toString.call(url) !== '[object String]') {
        throw new TypeError('You must supply a valid URL string');
    }

    /** Create a new promise. */
    return new Promise(function(resolve, reject) {
        /** Create a new http request and return the output. */
        http.get(url, function(res) {
            var out = '';

            res.setEncoding('binary');

            res.on('data', function(data) {
                out += data;
            });

            /** When the response ends, resolve the promise. */
            res.on('end', function() {
                resolve(out);
            });

        }).on('error', function(e) {
            console.log(e)
            /** If the get request fails, reject the promise with an error. */
            reject(e.message);
        });
    });
};

/**
 * Convenience method to identify an image using `imagemagick.identify()`/.
 * @param {string} data - A binary string for the image we want to identify.
 * @return a string containing the format of the image or `false` if not an
 * image.
 */
acatiris.identify = function(data) {
    /** Try to identify the image; if we cannot identify it, return false. */
    try {
        return acatiris.imagemagick.identify({srcData: data}).format;
    } catch (e) {
        return false;
    }
};
