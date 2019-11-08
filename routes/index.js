var express = require('express');
var router = express.Router();
var path = require('path');
var viewpath = path.join(path.join(__dirname, '../'), 'views/')

/* GET home page. */
router.get('/', function(req, res, next) {
   var options = {
        root: viewpath,
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.sendFile('index.html', options);
});

module.exports = router;
