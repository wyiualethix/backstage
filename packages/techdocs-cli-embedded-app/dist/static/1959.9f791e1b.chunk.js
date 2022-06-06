"use strict";(()=>{(self.webpackChunktechdocs_cli_embedded_app=self.webpackChunktechdocs_cli_embedded_app||[]).push([[1959],{52160:function(Z,m,n){var v,d=n(14859),e=n(93291);v={value:!0},m.Z=void 0;var h=e(n(2784)),f=d(n(50175)),y=(0,f.default)(h.createElement("path",{d:"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"}),"Language");m.Z=y},81959:function(Z,m,n){n.r(m),n.d(m,{EntityLinksCard:function(){return D}});var v=n(53479),d=n(52160),e=n(2784),h=n(79692),f=n(90436),y=n(77277),E=n(82339);const L=`metadata:
  name: example
  links:
    - url: https://dashboard.example.com
      title: My Dashboard
      icon: dashboard`,x=(0,h.Z)(a=>({code:{borderRadius:6,margin:`${a.spacing(2)}px 0px`,background:a.palette.type==="dark"?"#444":"#fff"}}),{name:"PluginCatalogEntityLinksEmptyState"});function C(){const a=x();return e.createElement(e.Fragment,null,e.createElement(f.Z,{variant:"body1"},"No links defined for this entity. You can add links to your entity YAML as shown in the highlighted example below:"),e.createElement("div",{className:a.code},e.createElement(E.CodeSnippet,{text:L,language:"yaml",showLineNumbers:!0,highlightedNumbers:[3,4,5,6],customStyle:{background:"inherit",fontSize:"115%"}})),e.createElement(y.Z,{variant:"contained",color:"primary",target:"_blank",href:"https://backstage.io/docs/features/software-catalog/descriptor-format#links-optional"},"Read more"))}var I=n(90348),b=n(11861),k=n(95544);const z=(0,h.Z)({svgIcon:{display:"inline-block","& svg":{display:"inline-block",fontSize:"inherit",verticalAlign:"baseline"}}});function S(a){const{href:c,text:o,Icon:s}=a,l=z();return e.createElement(k.Z,{display:"flex"},e.createElement(k.Z,{mr:1,className:l.svgIcon},e.createElement(f.Z,{component:"div"},s?e.createElement(s,null):e.createElement(d.Z,null))),e.createElement(k.Z,{flexGrow:"1"},e.createElement(E.Link,{to:c,target:"_blank",rel:"noopener"},o||c)))}var u=n(41156);const M={xs:1,sm:1,md:1,lg:2,xl:3};function N(a){var s,l;const c=[(0,u.Z)(t=>t.breakpoints.up("xl"))?"xl":null,(0,u.Z)(t=>t.breakpoints.up("lg"))?"lg":null,(0,u.Z)(t=>t.breakpoints.up("md"))?"md":null,(0,u.Z)(t=>t.breakpoints.up("sm"))?"sm":null,(0,u.Z)(t=>t.breakpoints.up("xs"))?"xs":null];let o=1;if(typeof a=="number")o=a;else{const t=(s=c.find(r=>r!==null))!=null?s:"xs";o=(l=a==null?void 0:a[t])!=null?l:M[t]}return o}function R(a){const{items:c,cols:o=void 0}=a,s=N(o);return e.createElement(I.Z,{rowHeight:"auto",cols:s},c.map(({text:l,href:t,Icon:r},g)=>e.createElement(b.Z,{key:g},e.createElement(S,{href:t,text:l!=null?l:t,Icon:r}))))}var A=n(36964);function D(a){var g;const{cols:c=void 0,variant:o}=a,{entity:s}=(0,v.useEntity)(),l=(0,A.useApp)(),t=p=>{var i;return p&&(i=l.getSystemIcon(p))!=null?i:d.Z},r=(g=s==null?void 0:s.metadata)==null?void 0:g.links;return e.createElement(E.InfoCard,{title:"Links",variant:o},!r||r.length===0?e.createElement(C,null):e.createElement(R,{cols:c,items:r.map(({url:p,title:i,icon:H})=>({text:i!=null?i:p,href:p,Icon:t(H)}))}))}}}]);})();

//# sourceMappingURL=1959.9f791e1b.chunk.js.map