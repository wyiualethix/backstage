(()=>{(self.webpackChunktechdocs_cli_embedded_app=self.webpackChunktechdocs_cli_embedded_app||[]).push([[5582],{43475:function(a){function s(e){const c={className:"number",begin:/[$%]\d+/},r={className:"number",begin:/\d+/},n={className:"number",begin:/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d{1,5})?/},o={className:"number",begin:/:\d{1,5}/};return{name:"Apache config",aliases:["apacheconf"],case_insensitive:!0,contains:[e.HASH_COMMENT_MODE,{className:"section",begin:/<\/?/,end:/>/,contains:[n,o,e.inherit(e.QUOTE_STRING_MODE,{relevance:0})]},{className:"attribute",begin:/\w+/,relevance:0,keywords:{nomarkup:"order deny allow setenv rewriterule rewriteengine rewritecond documentroot sethandler errordocument loadmodule options header listen serverroot servername"},starts:{end:/$/,relevance:0,keywords:{literal:"on off all deny allow"},contains:[{className:"meta",begin:/\s\[/,end:/\]$/},{className:"variable",begin:/[\$%]\{/,end:/\}/,contains:["self",c]},n,r,e.QUOTE_STRING_MODE]}}],illegal:/\S/}}a.exports=s}}]);})();

//# sourceMappingURL=react-syntax-highlighter_languages_highlight_apache.ca80f87c.chunk.js.map