
var Youtube = (function () {
    'use strict';

    var video, results;

    var getThumb = function (url, size = null) {
        if (url === null) {
            return '';
        }
        size    = (size === null) ? 'big' : size;
        // console.log(url.split('/'));
        url = url.split('/')
        url = url[url.length - 1];
        results = url.match('[\\?&]v=([^&#]*)');
        video   = (results === null) ? url : results[results.length - 1];

        if (size === 'small') {
            return 'http://img.youtube.com/vi/' + video + '/2.jpg';
        }
        return 'http://img.youtube.com/vi/' + video + '/0.jpg';
    };

    return {
        thumb: getThumb
    };
}());

//Example of usage:

// var thumb = Youtube.thumb('https://www.youtube.com/watch?v=ItZwa1AdrpU');
var thumb = Youtube.thumb('https://youtu.be/ItZwa1AdrpU');

console.log(thumb);