"use strict";(()=>{(self.webpackChunktechdocs_cli_embedded_app=self.webpackChunktechdocs_cli_embedded_app||[]).push([[2426],{62426:function(K,r,o){o.r(r),o.d(r,{RelatedEntitiesCard:function(){return u},asComponentEntities:function(){return E},asResourceEntities:function(){return f},asSystemEntities:function(){return T},componentEntityColumns:function(){return m},componentEntityHelpLink:function(){return y},resourceEntityColumns:function(){return d},resourceEntityHelpLink:function(){return p},systemEntityColumns:function(){return C},systemEntityHelpLink:function(){return b}});var a=o(90436),t=o(53479),e=o(2784),s=o(82339);function u(n){const{variant:i="gridItem",title:c,columns:k,entityKind:g,relationType:h,emptyMessage:v,emptyHelpLink:L,asRenderableEntities:R}=n,{entity:H}=(0,t.useEntity)(),{entities:S,loading:w,error:l}=(0,t.useRelatedEntities)(H,{type:h,kind:g});return w?e.createElement(s.InfoCard,{variant:i,title:c},e.createElement(s.Progress,null)):l?e.createElement(s.InfoCard,{variant:i,title:c},e.createElement(s.ResponseErrorPanel,{error:l})):e.createElement(t.EntityTable,{title:c,variant:i,emptyContent:e.createElement("div",{style:{textAlign:"center"}},e.createElement(a.Z,{variant:"body1"},v),e.createElement(a.Z,{variant:"body2"},e.createElement(s.Link,{to:L},"Learn how to change this."))),columns:k,entities:R(S||[])})}const m=[t.EntityTable.columns.createEntityRefColumn({defaultKind:"component"}),t.EntityTable.columns.createOwnerColumn(),t.EntityTable.columns.createSpecTypeColumn(),t.EntityTable.columns.createSpecLifecycleColumn(),t.EntityTable.columns.createMetadataDescriptionColumn()],y="https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component",E=n=>n,d=[t.EntityTable.columns.createEntityRefColumn({defaultKind:"resource"}),t.EntityTable.columns.createOwnerColumn(),t.EntityTable.columns.createSpecTypeColumn(),t.EntityTable.columns.createSpecLifecycleColumn(),t.EntityTable.columns.createMetadataDescriptionColumn()],p="https://backstage.io/docs/features/software-catalog/descriptor-format#kind-resource",f=n=>n,C=[t.EntityTable.columns.createEntityRefColumn({defaultKind:"system"}),t.EntityTable.columns.createOwnerColumn(),t.EntityTable.columns.createMetadataDescriptionColumn()],b="https://backstage.io/docs/features/software-catalog/descriptor-format#kind-system",T=n=>n}}]);})();

//# sourceMappingURL=2426.56f057f3.chunk.js.map