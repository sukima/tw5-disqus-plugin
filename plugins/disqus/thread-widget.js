/*\
title: $:/plugins/sukima/disqus/thread.js
type: applicaiton/javascript
module-type: widget

Manage the location and rendering of the DISQUS thread
\*/
var Widget = require('$:/core/modules/widgets/widget.js').widget;
var disqusUtils = require('$:/plugins/sukima/disqus/utils.js');

var DisqusThreadWidget = function(parseTreeNode, options) {
  this.initialise(parseTreeNode, options);
};

DisqusThreadWidget.prototype = new Widget();

DisqusThreadWidget.prototype.render = function(parent, nextSibling) {
  if (!$tw.browser) { return; } // only render if we are in the browser
  this.parentDomNode = parent;
  var threadNode = disqusUtils.createDisqusThread();
  this.domNodes.push(threadNode);
  this.parentDomNode.appendChild(threadNode);
  disqusUtils.reloadDisqusThread();
};

DisqusThreadWidget.prototype.refresh = function(changedTiddlers) {
  var needRefresh = disqusUtils.dependentTiddlers.some(function(tiddler) {
    return $tw.utils.hop(changedTiddlers, tiddler);
  });
  if (needRefresh) {
    this.refreshSelf();
  }
  return this.refreshChildren(changedTiddlers) || needRefresh;
};

exports['disqus-thread'] = DisqusThreadWidget;
