"use strict";(()=>{(self.webpackChunkexample_app=self.webpackChunkexample_app||[]).push([[2731],{12731:function(Q,g,a){a.r(g),a.d(g,{EntityPageAzurePipelines:function(){return w}});var d=a(95544),h=a(90436),l=a(12803),r=a(23192),v=a(72379),e=a(2784);const P=t=>e.createElement(v.Z,{...t,viewBox:"0 0 512 512"},e.createElement("path",{fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M461.81 53.81a4.4 4.4 0 00-3.3-3.39c-54.38-13.3-180 34.09-248.13 102.17a294.9 294.9 0 00-33.09 39.08c-21-1.9-42-.3-59.88 7.5-50.49 22.2-65.18 80.18-69.28 105.07a9 9 0 009.8 10.4l81.07-8.9a180.29 180.29 0 001.1 18.3 18.15 18.15 0 005.3 11.09l31.39 31.39a18.15 18.15 0 0011.1 5.3 179.91 179.91 0 0018.19 1.1l-8.89 81a9 9 0 0010.39 9.79c24.9-4 83-18.69 105.07-69.17 7.8-17.9 9.4-38.79 7.6-59.69a293.91 293.91 0 0039.19-33.09c68.38-68 115.47-190.86 102.37-247.95zM298.66 213.67a42.7 42.7 0 1160.38 0 42.65 42.65 0 01-60.38 0z"}),e.createElement("path",{fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M109.64 352a45.06 45.06 0 00-26.35 12.84C65.67 382.52 64 448 64 448s65.52-1.67 83.15-19.31A44.73 44.73 0 00160 402.32"}));var S=a(96299),y=a(150);const A=t=>{switch(t){case l.Q.Succeeded:return e.createElement("span",null,e.createElement(r.StatusOK,null)," Succeeded");case l.Q.PartiallySucceeded:return e.createElement("span",null,e.createElement(r.StatusWarning,null)," Partially Succeeded");case l.Q.Failed:return e.createElement("span",null,e.createElement(r.StatusError,null)," Failed");case l.Q.Canceled:return e.createElement("span",null,e.createElement(r.StatusAborted,null)," Canceled");case l.Q.None:default:return e.createElement("span",null,e.createElement(r.StatusWarning,null)," Unknown")}},C=(t,n)=>{switch(t){case l.hD.InProgress:return e.createElement("span",null,e.createElement(r.StatusRunning,null)," In Progress");case l.hD.Completed:return A(n);case l.hD.Cancelling:return e.createElement("span",null,e.createElement(r.StatusAborted,null)," Cancelling");case l.hD.Postponed:return e.createElement("span",null,e.createElement(r.StatusPending,null)," Postponed");case l.hD.NotStarted:return e.createElement("span",null,e.createElement(r.StatusAborted,null)," Not Started");case l.hD.None:default:return e.createElement("span",null,e.createElement(r.StatusWarning,null)," Unknown")}},z=[{title:"ID",field:"id",highlight:!1,width:"auto"},{title:"Build",field:"title",width:"auto",render:t=>e.createElement(r.Link,{to:t.link||""},t.title)},{title:"Source",field:"source",width:"auto"},{title:"State",width:"auto",render:t=>e.createElement(d.Z,{display:"flex",alignItems:"center"},e.createElement(h.Z,{variant:"button"},C(t.status,t.result)))},{title:"Duration",field:"queueTime",width:"auto",render:t=>e.createElement(d.Z,{display:"flex",alignItems:"center"},e.createElement(h.Z,null,(0,y.K)(t.startTime,t.finishTime)))},{title:"Age",field:"queueTime",width:"auto",render:t=>(t.queueTime?S.ou.fromISO(t.queueTime):S.ou.now()).toRelative()}],D=({items:t,loading:n,error:o})=>o?e.createElement("div",null,e.createElement(r.ResponseErrorPanel,{error:o})):e.createElement(r.Table,{isLoading:n,columns:z,options:{search:!0,paging:!0,pageSize:5,showEmptyDataSourceMessage:!n},title:e.createElement(d.Z,{display:"flex",alignItems:"center"},e.createElement(P,{style:{fontSize:30}}),e.createElement(d.Z,{mr:1}),"Azure Pipelines - Builds (",t?t.length:0,")"),data:t!=null?t:[]});var m=a(86864);function j(t){var i,u,s;const n=(i=t.metadata.annotations)==null?void 0:i[m.Ob];if(n){const{project:E,repo:f}=B(n);return{project:E,repo:f,definition:void 0}}const o=(u=t.metadata.annotations)==null?void 0:u[m.lA];if(!o)throw new Error("Value for annotation dev.azure.com/project was not found");const c=(s=t.metadata.annotations)==null?void 0:s[m._7];if(!c)throw new Error("Value for annotation dev.azure.com/build-definition was not found");return{project:o,repo:void 0,definition:c}}function B(t){const[n,o]=t.split("/");if(!n&&!o)throw new Error("Value for annotation dev.azure.com/project-repo was not in the correct format: <project-name>/<repo-name>");return{project:n,repo:o}}var I=a(43005),T=a(36964),x=a(64279);function R(t,n,o,c){const i={top:n!=null?n:m.vC},u=(0,T.useApi)(I.k),{value:s,loading:E,error:f}=(0,x.default)(()=>u.getBuildRuns(t,o,c,i),[u,t,o,c]);return{items:s==null?void 0:s.items,loading:E,error:f}}var Z=a(53479);const w=({defaultLimit:t})=>{const{entity:n}=(0,Z.useEntity)(),{project:o,repo:c,definition:p}=j(n),{items:i,loading:u,error:s}=R(o,t,c,p);return e.createElement(D,{items:i,loading:u,error:s})}}}]);})();

//# sourceMappingURL=2731.cda9a604.chunk.js.map