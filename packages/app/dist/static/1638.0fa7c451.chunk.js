"use strict";(()=>{(self.webpackChunkexample_app=self.webpackChunkexample_app||[]).push([[1638],{61638:function(w,j,m){m.r(j),m.d(j,{b:function(){return R}});var H=m(26312),S=Object.defineProperty,k=(y,O)=>S(y,"name",{value:O,configurable:!0});function I(y,O){return O.forEach(function(e){e&&typeof e!="string"&&!Array.isArray(e)&&Object.keys(e).forEach(function(u){if(u!=="default"&&!(u in y)){var n=Object.getOwnPropertyDescriptor(e,u);Object.defineProperty(y,u,n.get?n:{enumerable:!0,get:function(){return e[u]}})}})}),Object.freeze(y)}k(I,"_mergeNamespaces");var E={exports:{}};(function(y,O){(function(e){e(H.a.exports)})(function(e){function u(n){return function(s,a){var r=a.line,o=s.getLine(r);function c(i){for(var l,v=a.ch,p=0;;){var b=v<=0?-1:o.lastIndexOf(i[0],v-1);if(b==-1){if(p==1)break;p=1,v=o.length;continue}if(p==1&&b<a.ch)break;if(l=s.getTokenTypeAt(e.Pos(r,b+1)),!/^(comment|string)/.test(l))return{ch:b+1,tokenType:l,pair:i};v=b-1}}k(c,"findOpening");function h(i){var l=1,v=s.lastLine(),p,b=i.ch,F;e:for(var L=r;L<=v;++L)for(var T=s.getLine(L),P=L==r?b:0;;){var _=T.indexOf(i.pair[0],P),A=T.indexOf(i.pair[1],P);if(_<0&&(_=T.length),A<0&&(A=T.length),P=Math.min(_,A),P==T.length)break;if(s.getTokenTypeAt(e.Pos(L,P+1))==i.tokenType){if(P==_)++l;else if(!--l){p=L,F=P;break e}}++P}return p==null||r==p?null:{from:e.Pos(r,b),to:e.Pos(p,F)}}k(h,"findRange");for(var f=[],t=0;t<n.length;t++){var g=c(n[t]);g&&f.push(g)}f.sort(function(i,l){return i.ch-l.ch});for(var t=0;t<f.length;t++){var d=h(f[t]);if(d)return d}return null}}k(u,"bracketFolding"),e.registerHelper("fold","brace",u([["{","}"],["[","]"]])),e.registerHelper("fold","brace-paren",u([["{","}"],["[","]"],["(",")"]])),e.registerHelper("fold","import",function(n,s){function a(t){if(t<n.firstLine()||t>n.lastLine())return null;var g=n.getTokenAt(e.Pos(t,1));if(/\S/.test(g.string)||(g=n.getTokenAt(e.Pos(t,g.end+1))),g.type!="keyword"||g.string!="import")return null;for(var d=t,i=Math.min(n.lastLine(),t+10);d<=i;++d){var l=n.getLine(d),v=l.indexOf(";");if(v!=-1)return{startCh:g.end,end:e.Pos(d,v)}}}k(a,"hasImport");var r=s.line,o=a(r),c;if(!o||a(r-1)||(c=a(r-2))&&c.end.line==r-1)return null;for(var h=o.end;;){var f=a(h.line+1);if(f==null)break;h=f.end}return{from:n.clipPos(e.Pos(r,o.startCh+1)),to:h}}),e.registerHelper("fold","include",function(n,s){function a(f){if(f<n.firstLine()||f>n.lastLine())return null;var t=n.getTokenAt(e.Pos(f,1));if(/\S/.test(t.string)||(t=n.getTokenAt(e.Pos(f,t.end+1))),t.type=="meta"&&t.string.slice(0,8)=="#include")return t.start+8}k(a,"hasInclude");var r=s.line,o=a(r);if(o==null||a(r-1)!=null)return null;for(var c=r;;){var h=a(c+1);if(h==null)break;++c}return{from:e.Pos(r,o+1),to:n.clipPos(e.Pos(c))}})})})();var D=E.exports,R=Object.freeze(I({__proto__:null,[Symbol.toStringTag]:"Module",default:D},[E.exports]))}}]);})();

//# sourceMappingURL=1638.0fa7c451.chunk.js.map