"use strict";(()=>{(self.webpackChunkexample_app=self.webpackChunkexample_app||[]).push([[4759],{84759:function(y,r,t){t.r(r),t.d(r,{DomainExplorerContent:function(){return f}});var i=t(53479),m=t(77277),e=t(2784),c=t(64279),d=t(60562),n=t(23192),u=t(36964);const p=()=>{const a=(0,u.useApi)(i.catalogApiRef),{value:o,loading:E,error:s}=(0,c.default)(async()=>(await a.getEntities({filter:{kind:"domain"}})).items,[a]);return E?e.createElement(n.Progress,null):s?e.createElement(n.WarningPanel,{severity:"error",title:"Could not load domains."},s.message):o!=null&&o.length?e.createElement(n.ItemCardGrid,null,o.map((l,g)=>e.createElement(d.w,{key:g,entity:l}))):e.createElement(n.EmptyState,{missing:"info",title:"No domains to display",description:"You haven't added any domains yet.",action:e.createElement(m.Z,{variant:"contained",color:"primary",href:"https://backstage.io/docs/features/software-catalog/descriptor-format#kind-domain"},"Read more")})},f=({title:a})=>e.createElement(n.Content,{noPadding:!0},e.createElement(n.ContentHeader,{title:a!=null?a:"Domains"},e.createElement(n.SupportButton,null,"Discover the domains in your ecosystem.")),e.createElement(p,null))}}]);})();

//# sourceMappingURL=4759.18868109.chunk.js.map