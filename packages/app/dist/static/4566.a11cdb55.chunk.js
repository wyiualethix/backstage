"use strict";(()=>{(self.webpackChunkexample_app=self.webpackChunkexample_app||[]).push([[4566],{54566:function(E,b,a){a.r(b);var S=a(26312),l=a(7699),y=a(48250),t=a(2784),P=a(47093),m=Object.defineProperty,v=(u,o)=>m(u,"name",{value:o,configurable:!0});S.C.defineMode("graphql-variables",u=>{const o=(0,y.o)({eatWhitespace:p=>p.eatSpace(),lexRules:f,parseRules:h,editorConfig:{tabSize:u.tabSize}});return{config:u,startState:o.startState,token:o.token,indent:_,electricInput:/^\s*[}\]]/,fold:"brace",closeBrackets:{pairs:'[]{}""',explode:"[]{}"}}});function _(u,o){var p,e;const n=u.levels;return((!n||n.length===0?u.indentLevel:n[n.length-1]-(!((p=this.electricInput)===null||p===void 0)&&p.test(o)?1:0))||0)*(((e=this.config)===null||e===void 0?void 0:e.indentUnit)||0)}v(_,"indent");const f={Punctuation:/^\[|]|\{|\}|:|,/,Number:/^-?(?:0|(?:[1-9][0-9]*))(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?/,String:/^"(?:[^"\\]|\\(?:"|\/|\\|b|f|n|r|t|u[0-9a-fA-F]{4}))*"?/,Keyword:/^true|false|null/},h={Document:[(0,l.p)("{"),(0,l.l)("Variable",(0,l.o)((0,l.p)(","))),(0,l.p)("}")],Variable:[s("variable"),(0,l.p)(":"),"Value"],Value(u){switch(u.kind){case"Number":return"NumberValue";case"String":return"StringValue";case"Punctuation":switch(u.value){case"[":return"ListValue";case"{":return"ObjectValue"}return null;case"Keyword":switch(u.value){case"true":case"false":return"BooleanValue";case"null":return"NullValue"}return null}},NumberValue:[(0,l.t)("Number","number")],StringValue:[(0,l.t)("String","string")],BooleanValue:[(0,l.t)("Keyword","builtin")],NullValue:[(0,l.t)("Keyword","keyword")],ListValue:[(0,l.p)("["),(0,l.l)("Value",(0,l.o)((0,l.p)(","))),(0,l.p)("]")],ObjectValue:[(0,l.p)("{"),(0,l.l)("ObjectField",(0,l.o)((0,l.p)(","))),(0,l.p)("}")],ObjectField:[s("attribute"),(0,l.p)(":"),"Value"]};function s(u){return{style:u,match:o=>o.kind==="String",update(o,p){o.name=p.value.slice(1,-1)}}}v(s,"namedKey")},48250:function(E,b,a){a.d(b,{o:function(){return P}});var S=a(7699),l=a(95115),y=Object.defineProperty,t=(e,n)=>y(e,"name",{value:n,configurable:!0});function P(e={eatWhitespace:n=>n.eatWhile(S.i),lexRules:S.L,parseRules:S.P,editorConfig:{}}){return{startState(){const n={level:0,step:0,name:null,kind:null,type:null,rule:null,needsSeperator:!1,prevState:null};return f(e.parseRules,n,l.h.DOCUMENT),n},token(n,i){return m(n,i,e)}}}t(P,"onlineParser");function m(e,n,i){if(n.inBlockstring)return e.match(/.*"""/)?(n.inBlockstring=!1,"string"):(e.skipToEnd(),"string");const{lexRules:c,parseRules:g,eatWhitespace:k,editorConfig:R}=i;if(n.rule&&n.rule.length===0?h(n):n.needsAdvance&&(n.needsAdvance=!1,s(n,!0)),e.sol()){const r=R&&R.tabSize||2;n.indentLevel=Math.floor(e.indentation()/r)}if(k(e))return"ws";const d=p(c,e);if(!d)return e.match(/\S+/)||e.match(/\s/),f(_,n,"Invalid"),"invalidchar";if(d.kind==="Comment")return f(_,n,"Comment"),"comment";const O=v({},n);if(d.kind==="Punctuation"){if(/^[{([]/.test(d.value))n.indentLevel!==void 0&&(n.levels=(n.levels||[]).concat(n.indentLevel+1));else if(/^[})\]]/.test(d.value)){const r=n.levels=(n.levels||[]).slice(0,-1);n.indentLevel&&r.length>0&&r[r.length-1]<n.indentLevel&&(n.indentLevel=r[r.length-1])}}for(;n.rule;){let r=typeof n.rule=="function"?n.step===0?n.rule(d,e):null:n.rule[n.step];if(n.needsSeperator&&(r=r&&(r==null?void 0:r.separator)),r){if(r.ofRule&&(r=r.ofRule),typeof r=="string"){f(g,n,r);continue}if(r.match&&r.match(d))return r.update&&r.update(n,d),d.kind==="Punctuation"?s(n,!0):n.needsAdvance=!0,r.style}o(n)}return v(n,O),f(_,n,"Invalid"),"invalidchar"}t(m,"getToken");function v(e,n){const i=Object.keys(n);for(let c=0;c<i.length;c++)e[i[c]]=n[i[c]];return e}t(v,"assign");const _={Invalid:[],Comment:[]};function f(e,n,i){if(!e[i])throw new TypeError("Unknown rule: "+i);n.prevState=Object.assign({},n),n.kind=i,n.name=null,n.type=null,n.rule=e[i],n.step=0,n.needsSeperator=!1}t(f,"pushRule");function h(e){!e.prevState||(e.kind=e.prevState.kind,e.name=e.prevState.name,e.type=e.prevState.type,e.rule=e.prevState.rule,e.step=e.prevState.step,e.needsSeperator=e.prevState.needsSeperator,e.prevState=e.prevState.prevState)}t(h,"popRule");function s(e,n){if(u(e)&&e.rule){const i=e.rule[e.step];if(i.separator){const c=i.separator;if(e.needsSeperator=!e.needsSeperator,!e.needsSeperator&&c.ofRule)return}if(n)return}for(e.needsSeperator=!1,e.step++;e.rule&&!(Array.isArray(e.rule)&&e.step<e.rule.length);)h(e),e.rule&&(u(e)?e.rule&&e.rule[e.step].separator&&(e.needsSeperator=!e.needsSeperator):(e.needsSeperator=!1,e.step++))}t(s,"advanceRule");function u(e){const n=Array.isArray(e.rule)&&typeof e.rule[e.step]!="string"&&e.rule[e.step];return n&&n.isList}t(u,"isList");function o(e){for(;e.rule&&!(Array.isArray(e.rule)&&e.rule[e.step].ofRule);)h(e);e.rule&&s(e,!1)}t(o,"unsuccessful");function p(e,n){const i=Object.keys(e);for(let c=0;c<i.length;c++){const g=n.match(e[i[c]]);if(g&&g instanceof Array)return{kind:i[c],value:g[0]}}}t(p,"lex")}}]);})();

//# sourceMappingURL=4566.a11cdb55.chunk.js.map