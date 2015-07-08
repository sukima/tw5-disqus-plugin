/*\
title: $:/plugins/sukima/disqus/startup.js
type: application/javascript
module-type: startup

Load the required DISQUS scripts
\*/
var disqusUtils = require('$:/plugins/sukima/disqus/utils.js');

function handleChangeEvent(changes) {
  if (changes['$:/config/disqus/shortname']) {
    disqusUtils.log('Disqus shortname changed; TiddlyWiki needs reloading.');
    $tw.wiki.changeCount['$:/plugins/sukima/disqus'] = 1;
    $tw.wiki.deleteTiddler('$:/temp/HidePluginWarning');
  }
}

exports.name = "load-disqus-scripts";

exports.platforms = ["browser"];

exports.synchronous = true;

exports.startup = function() {
  $tw.wiki.addEventListener('change', handleChangeEvent);

  var shortname = disqusUtils.getConfig('shortname');
  window.disqus_shortname = shortname; // jshint ignore:line

  if (shortname) {
    // Disqus requires the #disqus_thread in the document during initial load.
    var initialDisqusThread = disqusUtils.createDisqusThread();
    $tw.utils.addClass(initialDisqusThread, 'disqus-hidden');
    document.getElementsByTagName('body')[0].appendChild(initialDisqusThread);

    disqusUtils.loadDisqusScript(shortname, 'embed');
    disqusUtils.loadDisqusScript(
      shortname, 'count', disqusUtils.reloadDisqusCounts
    );
  }
};
