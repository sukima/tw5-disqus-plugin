/*\
title: $:/plugins/sukima/disqus/utils.js
type: application/javascript
module-type: library

Utility functions for working with Disqus
\*/
var TIDDLER_PREFIX = '$:/config/disqus/';
var logger, countReloadTriggered;

exports.log = function() {
  if (!logger) {
    logger = new $tw.utils.Logger('Disqus');
  }
  logger.log.apply(logger, arguments);
};

exports.dependentTiddlers = ['shortname', 'identifier', 'url', 'title']
  .map(function(item) { return TIDDLER_PREFIX + item; });

exports.loadDisqusScript = function(shortname, scriptname) {
  var disqusScript = document.createElement('script');
  disqusScript.type = 'application/javascript';
  disqusScript.src = '//' + shortname + '.disqus.com/' + scriptname + '.js';
  disqusScript.async = true;
  disqusScript.defer = true;
  exports.log('Loading Disqus script ' + disqusScript.src);
  document.getElementsByTagName('head')[0].appendChild(disqusScript);
};

exports.createDisqusThread = function() {
  var disqusThread = document.createElement('div');
  disqusThread.setAttribute('id', 'disqus_thread');
  disqusThread.className = 'disqus-comments';
  return disqusThread;
};

exports.getPageOptions = function() {
  return {
    identifier: exports.getConfig('identifier'),
    url: exports.getConfig('url'),
    title: exports.getConfig('title')
  };
};

exports.getConfig = function(option) {
  return $tw.wiki.getTiddlerText(TIDDLER_PREFIX + option);
};

exports.setConfig = function(option, value) {
  $tw.wiki.setTextReference(TIDDLER_PREFIX + option, value);
};

exports.reloadDisqusThread = function() {
  if (!window.DISQUS) { return; }
  var page = exports.getPageOptions();
  exports.log('Reloading Disqus thread for ' + page.identifier);
  $tw.utils.nextTick(function() {
    $tw.wiki.dispatchEvent('disqus-thread-change');
  });
  window.DISQUS.reset({
    reload: true,
    config: function() {
      this.page = page;
    }
  });
};

exports.reloadDisqusCounts = function() {
  if (!window.DISQUSWIDGETS || countReloadTriggered) { return; }
  // Prevent multiple calls per event loop, we only need one.
  countReloadTriggered = true;
  $tw.utils.nextTick(function() {
    exports.log('Reloading Disqus counts');
    countReloadTriggered = false;
    // Disqus caches previous counts. Even though the DOM element was removed
    // and readded it still holds the same identifier / url which was
    // previously cached. {reset: true} clears the case so the cunts can be
    // refreshed when the widgets render again.
    window.DISQUSWIDGETS.getCount({reset: true});
    $tw.wiki.dispatchEvent('disqus-count-change');
  });
};
