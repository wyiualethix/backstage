"use strict";(()=>{(self.webpackChunkexample_app=self.webpackChunkexample_app||[]).push([[8090],{88090:function(O,s,l){l.r(s),l.d(s,{TodoList:function(){return u}});var E=l(53479),e=l(2784),v=l(98459),n=l(23192),T=l(36964);const d=10,x=[{title:"Tag",field:"tag",width:"10%",filtering:!1},{title:"Text",field:"text",width:"55%",highlight:!0,render:({text:o})=>e.createElement(n.OverflowTooltip,{text:o})},{title:"File",field:"repoFilePath",width:"25%",render:({viewUrl:o,repoFilePath:a})=>o?e.createElement(n.Link,{to:o,target:"_blank"},e.createElement(n.OverflowTooltip,{text:a})):e.createElement(n.OverflowTooltip,{text:a})},{title:"Author",field:"author",width:"10%",render:({author:o})=>e.createElement(n.OverflowTooltip,{text:o})}],u=()=>{const{entity:o}=(0,E.useEntity)(),a=(0,T.useApi)(v.v),[c,C]=(0,e.useState)();return c?e.createElement(n.ResponseErrorPanel,{error:c}):e.createElement(n.Table,{title:"TODOs",options:{search:!1,pageSize:d,padding:"dense",sorting:!0,draggable:!1,paging:!0,filtering:!0,debounceInterval:500,filterCellStyle:{padding:"0 16px 0 20px"}},columns:x,data:async t=>{var f,p,g;try{const r=(f=t==null?void 0:t.page)!=null?f:0,m=(p=t==null?void 0:t.pageSize)!=null?p:d,i=await a.listTodos({entity:o,offset:r*m,limit:m,orderBy:(t==null?void 0:t.orderBy)&&{field:t.orderBy.field,direction:t.orderDirection},filters:(g=t==null?void 0:t.filters)==null?void 0:g.map(h=>({field:h.column.field,value:`*${h.value}*`}))});return{data:i.items,totalCount:i.totalCount,page:Math.floor(i.offset/i.limit)}}catch(r){return C(r),{data:[],totalCount:0,page:0}}}})}}}]);})();

//# sourceMappingURL=8090.2b868353.chunk.js.map