This is unused because Disqus customizes the text via the admin panel. However
if someone wanted it could be don as a postRender hook with a hack to customize
the comment text with WikiText:

    var buttonWikiText = this.text || this.getVariable('tv-disqus-comment-text');
    if (buttonWikiText) {
      var count = this.buttonNode.textContent.replace(/[\D]/g, '') || '0';
      var buttonText = this.wiki.renderText(
        'text/plain', 'text/vnd.tiddlywiki', buttonWikiText,
        {
          parseAsInline: true,
          variables: {
            count: count
          },
          parentWidget: this
        }
      );
      this.buttonNode.textContent = buttonText;
    }
