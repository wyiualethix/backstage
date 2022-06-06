"use strict";(()=>{(self.webpackChunkexample_app=self.webpackChunkexample_app||[]).push([[498],{38634:function(b,M,l){l.d(M,{a:function(){return d},b:function(){return j},c:function(){return k},d:function(){return E},e:function(){return O},g:function(){return _}});var i=l(79646),f=l(14862),T=l(23690),y=Object.defineProperty,p=(n,a)=>y(n,"name",{value:a,configurable:!0});function _(n,a){const e={schema:n,type:null,parentType:null,inputType:null,directiveDef:null,fieldDef:null,argDef:null,argDefs:null,objectFieldDefs:null};return(0,T.f)(a,t=>{switch(t.kind){case"Query":case"ShortQuery":e.type=n.getQueryType();break;case"Mutation":e.type=n.getMutationType();break;case"Subscription":e.type=n.getSubscriptionType();break;case"InlineFragment":case"FragmentDefinition":t.type&&(e.type=n.getType(t.type));break;case"Field":case"AliasedField":e.fieldDef=e.type&&t.name?c(n,e.parentType,t.name):null,e.type=e.fieldDef&&e.fieldDef.type;break;case"SelectionSet":e.parentType=e.type?(0,i.xC)(e.type):null;break;case"Directive":e.directiveDef=t.name?n.getDirective(t.name):null;break;case"Arguments":const u=t.prevState?t.prevState.kind==="Field"?e.fieldDef:t.prevState.kind==="Directive"?e.directiveDef:t.prevState.kind==="AliasedField"?t.prevState.name&&c(n,e.parentType,t.prevState.name):null:null;e.argDefs=u?u.args:null;break;case"Argument":if(e.argDef=null,e.argDefs){for(let D=0;D<e.argDefs.length;D++)if(e.argDefs[D].name===t.name){e.argDef=e.argDefs[D];break}}e.inputType=e.argDef&&e.argDef.type;break;case"EnumValue":const r=e.inputType?(0,i.xC)(e.inputType):null;e.enumValue=r instanceof i.mR?m(r.getValues(),D=>D.value===t.name):null;break;case"ListValue":const s=e.inputType?(0,i.tf)(e.inputType):null;e.inputType=s instanceof i.p2?s.ofType:null;break;case"ObjectValue":const o=e.inputType?(0,i.xC)(e.inputType):null;e.objectFieldDefs=o instanceof i.sR?o.getFields():null;break;case"ObjectField":const g=t.name&&e.objectFieldDefs?e.objectFieldDefs[t.name]:null;e.inputType=g&&g.type;break;case"NamedType":e.type=t.name?n.getType(t.name):null;break}}),e}p(_,"getTypeInfo");function c(n,a,e){if(e===f.S.name&&n.getQueryType()===a)return f.S;if(e===f.T.name&&n.getQueryType()===a)return f.T;if(e===f.a.name&&(0,i.Gv)(a))return f.a;if(a&&a.getFields)return a.getFields()[e]}p(c,"getFieldDef");function m(n,a){for(let e=0;e<n.length;e++)if(a(n[e]))return n[e]}p(m,"find");function d(n){return{kind:"Field",schema:n.schema,field:n.fieldDef,type:v(n.fieldDef)?null:n.parentType}}p(d,"getFieldReference");function j(n){return{kind:"Directive",schema:n.schema,directive:n.directiveDef}}p(j,"getDirectiveReference");function k(n){return n.directiveDef?{kind:"Argument",schema:n.schema,argument:n.argDef,directive:n.directiveDef}:{kind:"Argument",schema:n.schema,argument:n.argDef,field:n.fieldDef,type:v(n.fieldDef)?null:n.parentType}}p(k,"getArgumentReference");function E(n){return{kind:"EnumValue",value:n.enumValue||void 0,type:n.inputType?(0,i.xC)(n.inputType):void 0}}p(E,"getEnumValueReference");function O(n,a){return{kind:"Type",schema:n.schema,type:a||n.type}}p(O,"getTypeReference");function v(n){return n.name.slice(0,2)==="__"}p(v,"isMetaField")},23690:function(b,M,l){l.d(M,{f:function(){return T}});var i=Object.defineProperty,f=(y,p)=>i(y,"name",{value:p,configurable:!0});function T(y,p){const _=[];let c=y;for(;c&&c.kind;)_.push(c),c=c.prevState;for(let m=_.length-1;m>=0;m--)p(_[m])}f(T,"forEachState")},20498:function(b,M,l){l.r(M);var i=l(26312),f=l(38634),T=l(7699),y=l(2784),p=l(47093),_=l(14862),c=l(23690),m=Object.defineProperty,d=(e,t)=>m(e,"name",{value:t,configurable:!0});i.C.defineOption("jump",!1,(e,t,u)=>{if(u&&u!==i.C.Init){const r=e.state.jump.onMouseOver;i.C.off(e.getWrapperElement(),"mouseover",r);const s=e.state.jump.onMouseOut;i.C.off(e.getWrapperElement(),"mouseout",s),i.C.off(document,"keydown",e.state.jump.onKeyDown),delete e.state.jump}if(t){const r=e.state.jump={options:t,onMouseOver:j.bind(null,e),onMouseOut:k.bind(null,e),onKeyDown:E.bind(null,e)};i.C.on(e.getWrapperElement(),"mouseover",r.onMouseOver),i.C.on(e.getWrapperElement(),"mouseout",r.onMouseOut),i.C.on(document,"keydown",r.onKeyDown)}});function j(e,t){const u=t.target||t.srcElement;if(!(u instanceof HTMLElement)||(u==null?void 0:u.nodeName)!=="SPAN")return;const r=u.getBoundingClientRect(),s={left:(r.left+r.right)/2,top:(r.top+r.bottom)/2};e.state.jump.cursor=s,e.state.jump.isHoldingModifier&&n(e)}d(j,"onMouseOver");function k(e){if(!e.state.jump.isHoldingModifier&&e.state.jump.cursor){e.state.jump.cursor=null;return}e.state.jump.isHoldingModifier&&e.state.jump.marker&&a(e)}d(k,"onMouseOut");function E(e,t){if(e.state.jump.isHoldingModifier||!v(t.key))return;e.state.jump.isHoldingModifier=!0,e.state.jump.cursor&&n(e);const u=d(o=>{o.code===t.code&&(e.state.jump.isHoldingModifier=!1,e.state.jump.marker&&a(e),i.C.off(document,"keyup",u),i.C.off(document,"click",r),e.off("mousedown",s))},"onKeyUp"),r=d(o=>{const g=e.state.jump.destination;g&&e.state.jump.options.onClick(g,o)},"onClick"),s=d((o,g)=>{e.state.jump.destination&&(g.codemirrorIgnore=!0)},"onMouseDown");i.C.on(document,"keyup",u),i.C.on(document,"click",r),e.on("mousedown",s)}d(E,"onKeyDown");const O=typeof navigator!="undefined"&&navigator&&navigator.appVersion.indexOf("Mac")!==-1;function v(e){return e===(O?"Meta":"Control")}d(v,"isJumpModifier");function n(e){if(e.state.jump.marker)return;const t=e.state.jump.cursor,u=e.coordsChar(t),r=e.getTokenAt(u,!0),s=e.state.jump.options,o=s.getDestination||e.getHelper(u,"jump");if(o){const g=o(r,s,e);if(g){const D=e.markText({line:u.line,ch:r.start},{line:u.line,ch:r.end},{className:"CodeMirror-jump-token"});e.state.jump.marker=D,e.state.jump.destination=g}}}d(n,"enableJumpMode");function a(e){const t=e.state.jump.marker;e.state.jump.marker=null,e.state.jump.destination=null,t.clear()}d(a,"disableJumpMode"),i.C.registerHelper("jump","graphql",(e,t)=>{if(!t.schema||!t.onClick||!e.state)return;const u=e.state,r=u.kind,s=u.step,o=(0,f.g)(t.schema,u);if(r==="Field"&&s===0&&o.fieldDef||r==="AliasedField"&&s===2&&o.fieldDef)return(0,f.a)(o);if(r==="Directive"&&s===1&&o.directiveDef)return(0,f.b)(o);if(r==="Argument"&&s===0&&o.argDef)return(0,f.c)(o);if(r==="EnumValue"&&o.enumValue)return(0,f.d)(o);if(r==="NamedType"&&o.type)return(0,f.e)(o)})}}]);})();

//# sourceMappingURL=498.3aec1780.chunk.js.map