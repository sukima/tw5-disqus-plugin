/*\
title: $:/plugins/sukima/disqus/count.js
type: application/javascript
module-type: widget

Display the Disqus coment count for a tiddler
\*/
var Widget = require('$:/core/modules/widgets/widget.js').widget;
var disqusUtils = require('$:/plugins/sukima/disqus/utils.js');

var DisqusCountWidget = function(parseTreeNode, options) {
  this.initialise(parseTreeNode, options);
  this.postRender = this.postRender.bind(this);
};

DisqusCountWidget.prototype = new Widget();

DisqusCountWidget.prototype.render = function(parent, nextSibling) {
  if (!$tw.browser) { return; }

  this.parentNode = parent;
  this.computeAttributes();
  this.execute();

  if (!this.enabled) { return; }

  this.buttonNode = this.createCountElement();
  parent.insertBefore(this.buttonNode, nextSibling);
  this.domNodes.push(this.buttonNode);
  $tw.utils.addEventListeners(this.buttonNode, [
    {name: 'click', handlerObject: this, handlerMethod: 'loadDisqusThread'}
  ]);

  $tw.wiki.addEventListener('disqus-count-change', this.postRender);
  disqusUtils.reloadDisqusCounts();
};

DisqusCountWidget.prototype.createCountElement = function() {
  var domNode = document.createElement('button');
  domNode.className = 'disqus-comment-count disqus-hidden tc-btn-invisible';
  if (this.url) {
    domNode.setAttribute('data-disqus-url', this.url);
  } else {
    domNode.setAttribute('data-disqus-identifier', this.identifier);
  }
  return domNode;
};

DisqusCountWidget.prototype.execute = function() {
  this.title = this.getVariable('currentTiddler');
  var tiddler = $tw.wiki.getTiddler(this.title);
  this.enabled = this.getAttribute('enableDisqus') ||
    (tiddler && tiddler.hasTag('Disqus'));
  this.identifier = this.getAttribute(
    'disqus-id', encodeURIComponent(this.title.replace(/\s+/g, '-'))
  );
  var permalink = $tw.browser ? this.getPermalink() : null;
  this.url = this.getAttribute('url', permalink);
};

DisqusCountWidget.prototype.getPermalink = function() {
  // See core/modules/startup/story.js for how permalinks are constructed.
  // https://github.com/Jermolene/TiddlyWiki5/blob/master/core/modules/startup/story.js#L165-L180
  return [
    window.location.toString().split("#")[0],
    encodeURIComponent(this.title)
  ].join("#");
};

DisqusCountWidget.prototype.postRender = function() {
  $tw.wiki.removeEventListener('disqus-count-change', this.postRender);
  $tw.utils.removeClass(this.buttonNode, 'disqus-hidden');
};

DisqusCountWidget.prototype.refresh = function(changedTiddlers) {
  var changedAttributes = this.computeAttributes();
  if (changedAttributes.identifier ||
      changedAttributes.url ||
      changedAttributes.title) {
    this.refreshSelf();
    return true;
  }
  return false;
};

DisqusCountWidget.prototype.loadDisqusThread = function() {
  disqusUtils.setConfig('identifier', this.identifier);
  disqusUtils.setConfig('url', this.url);
  disqusUtils.setConfig('title', this.title);

  // Auto select the Disqus thread tab in the sidebar and remove any search.
  // This is so the user can see the thread when he/she clicks on the link.
  var sideBarStateTiddler =
    $tw.wiki.filterTiddlers('[prefix[$:/state/tab/sidebar]]')[0];
  if (sideBarStateTiddler) {
    $tw.wiki.setTextReference(
      sideBarStateTiddler, '$:/plugins/sukima/disqus/ThreadSideBar'
    );
  }
  $tw.wiki.setTextReference('$:/temp/search', '');
};

exports['disqus-count'] = DisqusCountWidget;
