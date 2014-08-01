module.exports = function(app) {
  var mincer = require('mincer'),
      path   = require('path'),
      debug  = require('debug')('myApp:mincer');

  mincer.logger.use({
    error: function(level, msg) {
      console.error('ERROR:', msg);
    },
    log: function(level, msg) {
      debug(level +": "+ msg);
    }
  });
  
  var environment = new mincer.Environment(__dirname);
  environment.enable('source_maps');// Enable source maps support
  //environment.sourceRoot = '/'; // use to cheat nesting level in dev tools

  // Configure environment load paths (where to find assets)
  environment.appendPath('../assets/javascripts');
  environment.appendPath('../assets/stylesheets');
  environment.appendPath('../assets/images');
  environment.appendPath('../assets/fonts');

  // Define environment essential *_path helper that will be available in the
  // processed assets. See `assets/stylesheets/app.css.ejs` for example.
  environment.ContextClass.defineAssetPath(function (pathname, options) {
    var asset = this.environment.findAsset(pathname, options);
    if (!asset) { 
      throw new Error("File " + pathname + " not found");
    }
    return '/assets/' + asset.digestPath;
  });

  // Enable auto-Prefixer
  environment.enable("autoprefixer");

  // Prepare production-ready environment
  if ('production' === process.env.NODE_ENV) {
    // Cache compiled assets.
    environment.cache = new mincer.FileStore(path.join(__dirname, 'cache'));
    // Enable JS and CSS compression
    environment.jsCompressor  = "uglify";
    // (!) use csswring, because csso does not supports sourcemaps
    environment.cssCompressor = "csswring";
    // cache environment. 
    environment = environment.index;
  }
  app.use('/assets/', mincer.createServer(environment));

  /* 
   * Asset View helpers
   * Allows you to call javascript("filename.js") or stylesheet("filename.css")
   * in your templates.
   */
  function rewrite_extension(source, ext) {
    var source_ext = path.extname(source);
    return (source_ext === ext) ? source : (source + ext);
  }

  function alertAssetNotFound(fileType, logicalPath){
      return '<script type="application/javascript">alert("' + fileType + ' file ' +
             JSON.stringify(logicalPath).replace(/"/g, '\\"') +
             ' not found.")</script>';
  }

  app.locals.asset_path = function(logicalPath) {
    var asset = environment.findAsset(logicalPath);
    if (asset) {
      return '/assets/' + asset.digestPath
    }
  }

  app.locals.javascript = function javascript(logicalPath) {
    var asset = environment.findAsset(logicalPath);
    if (!asset) alertAssetNotFound("Javascript", logicalPath);
    return '<script type="application/javascript" src="/assets/' +
            rewrite_extension(asset.digestPath, '.js') +
            '"></script>';
  };

  app.locals.stylesheet = function stylesheet(logicalPath) {
    var asset = environment.findAsset(logicalPath);
    if (!asset) alertAssetNotFound("Stylesheet", logicalPath);
    return '<link rel="stylesheet" type="text/css" href="/assets/' +
            rewrite_extension(asset.digestPath, '.css') +
            '" />';
  };
}

