(()=>{(self.webpackChunktechdocs_cli_embedded_app=self.webpackChunktechdocs_cli_embedded_app||[]).push([[7719],{51247:function(S){function o(e){return e?typeof e=="string"?e:e.source:null}function m(e){return t("(",e,")*")}function T(e){return t("(",e,")?")}function t(...e){return e.map(a=>o(a)).join("")}function A(...e){return"("+e.map(a=>o(a)).join("|")+")"}function R(e){const n={"builtin-name":["action","bindattr","collection","component","concat","debugger","each","each-in","get","hash","if","in","input","link-to","loc","log","lookup","mut","outlet","partial","query-params","render","template","textarea","unbound","unless","view","with","yield"]},a={literal:["true","false","undefined","null"]},b=/""|"[^"]+"/,I=/''|'[^']+'/,c=/\[\]|\[[^\]]+\]/,_=/[^\s!"#%&'()*+,.\/;<=>@\[\\\]^`{|}~]+/,O=/(\.|\/)/,r=A(b,I,c,_),g=t(T(/\.|\.\/|\//),r,m(t(O,r))),C=t("(",c,"|",_,")(?==)"),s={begin:g,lexemes:/[\w.\/]+/},N=e.inherit(s,{keywords:a}),E={begin:/\(/,end:/\)/},p={className:"attr",begin:C,relevance:0,starts:{begin:/=/,end:/=/,starts:{contains:[e.NUMBER_MODE,e.QUOTE_STRING_MODE,e.APOS_STRING_MODE,N,E]}}},P={begin:/as\s+\|/,keywords:{keyword:"as"},end:/\|/,contains:[{begin:/\w+/}]},i={contains:[e.NUMBER_MODE,e.QUOTE_STRING_MODE,e.APOS_STRING_MODE,P,p,N,E],returnEnd:!0},H=e.inherit(s,{className:"name",keywords:n,starts:e.inherit(i,{end:/\)/})});E.contains=[H];const d=e.inherit(s,{keywords:n,className:"name",starts:e.inherit(i,{end:/\}\}/})}),l=e.inherit(s,{keywords:n,className:"name"}),u=e.inherit(s,{className:"name",keywords:n,starts:e.inherit(i,{end:/\}\}/})});return{name:"Handlebars",aliases:["hbs","html.hbs","html.handlebars","htmlbars"],case_insensitive:!0,subLanguage:"xml",contains:[{begin:/\\\{\{/,skip:!0},{begin:/\\\\(?=\{\{)/,skip:!0},e.COMMENT(/\{\{!--/,/--\}\}/),e.COMMENT(/\{\{!/,/\}\}/),{className:"template-tag",begin:/\{\{\{\{(?!\/)/,end:/\}\}\}\}/,contains:[d],starts:{end:/\{\{\{\{\//,returnEnd:!0,subLanguage:"xml"}},{className:"template-tag",begin:/\{\{\{\{\//,end:/\}\}\}\}/,contains:[l]},{className:"template-tag",begin:/\{\{#/,end:/\}\}/,contains:[d]},{className:"template-tag",begin:/\{\{(?=else\}\})/,end:/\}\}/,keywords:"else"},{className:"template-tag",begin:/\{\{(?=else if)/,end:/\}\}/,keywords:"else if"},{className:"template-tag",begin:/\{\{\//,end:/\}\}/,contains:[l]},{className:"template-variable",begin:/\{\{\{/,end:/\}\}\}/,contains:[u]},{className:"template-variable",begin:/\{\{/,end:/\}\}/,contains:[u]}]}}S.exports=R}}]);})();

//# sourceMappingURL=react-syntax-highlighter_languages_highlight_handlebars.2b1aa2f3.chunk.js.map