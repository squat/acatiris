
# acatiris

Acatiris (pronounced a cat iris, an anagram of ASCII art), is an ASCII art middleware for Express. You can use Acatiris at the end of your application's middleware stack to convert all the images in your HTML into ASCII, or as a controller to create an ASCII art endpoint.

## Installation

Install with [npm](http://npmjs.org):

    $ npm install acatiris
    
Acatiris needs the [jp2a](http://csl.name/jp2a/) and [Imagemagick](http://www.imagemagick.org/) CLI tools installed and available on the system's $PATH.

For example:

* on OS X you can install jp2a with [Homebrew](http://brew.sh/) by running: `$ brew install jp2a imagemagick`
* on Ubuntu/Debian you can install jp2a with `apt-get`: `$ sudo apt-get install jp2a libmagick++-dev`

## Example

### Middleware

To convert the images in your application's HTML into ASCII, put Acatiris at the end of your middleware stack:

````js
// Import Acatiris.
var acatiris = require('acatiris');

// Create a sample endpoint.
app.get('/', function(req, res, next){
    res.body = 'hit me up <a href="https://twitter.com/lsvx">@lsvx</a><img src="http://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png"/>';
    next();
});

app.use(acatiris);

/*
Will output:
 
hit me up @lsvx
 
..................................................
..................................................
..................................................
..................................................
..................................................
..................................................
..................................................
..................................................
..................................................
..................................................
..................................................
......................,llll.......;cooooc;........
......................lKKKK'....l0KKKKKKKK0o......
......................lKKKK'...oKKK0o::lOKkl'.....
......................lKKKK'...OKKKk.....'........
......................lKKKK'...lKKKKOo:'..........
......................lKKKK'....:OKKKKKK0dc'......
......................lKKKK'......,cxOKKKKK0d.....
......................lKKKK'..........':dKKKKx....
...............'c'....oKKKK'...,ld'......xKKKK....
.............:OKK0dcco0KKKx...kKKK0xlcclxKKKKd....
..............lOKKKKKKKK0o.....ckKKKKKKKKKKOc.....
................,cloooc;..........;cloool:'.......
..................................................
..................................................
*/
````

### Endpoint

To add an ASCII art endpoint to your application, simply include Acatiris like you would and controller:

````js
// Import Acatiris.
var acatiris = require('acatiris');

app.use('/ascii', acatiris.endpoint);
````

Now, a requests to `lsvx.com/ascii/<url>`, such as [http://lsvx.com/ascii/http://o-dub.com/images/rapcat.jpg](http://lsvx.com/ascii/http://o-dub.com/images/rapcat.jpg) will generate something sweet.

## License

MIT
