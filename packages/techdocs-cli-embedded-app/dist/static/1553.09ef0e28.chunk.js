"use strict";(()=>{(self.webpackChunktechdocs_cli_embedded_app=self.webpackChunktechdocs_cli_embedded_app||[]).push([[1553,2426],{11553:function(y,i,n){n.r(i),n.d(i,{HasResourcesCard:function(){return s}});var r=n(48023),t=n(2784),e=n(62426);function s(a){const{variant:c="gridItem"}=a;return t.createElement(e.RelatedEntitiesCard,{variant:c,title:"Has resources",entityKind:"Resource",relationType:r.aS,columns:e.resourceEntityColumns,asRenderableEntities:e.asResourceEntities,emptyMessage:"No resource is part of this system",emptyHelpLink:e.resourceEntityHelpLink})}},62426:function(y,i,n){n.r(i),n.d(i,{RelatedEntitiesCard:function(){return a},asComponentEntities:function(){return d},asResourceEntities:function(){return C},asSystemEntities:function(){return b},componentEntityColumns:function(){return c},componentEntityHelpLink:function(){return E},resourceEntityColumns:function(){return p},resourceEntityHelpLink:function(){return f},systemEntityColumns:function(){return T},systemEntityHelpLink:function(){return R}});var r=n(90436),t=n(53479),e=n(2784),s=n(82339);function a(o){const{variant:l="gridItem",title:u,columns:v,entityKind:g,relationType:h,emptyMessage:L,emptyHelpLink:k,asRenderableEntities:H}=o,{entity:S}=(0,t.useEntity)(),{entities:K,loading:M,error:m}=(0,t.useRelatedEntities)(S,{type:h,kind:g});return M?e.createElement(s.InfoCard,{variant:l,title:u},e.createElement(s.Progress,null)):m?e.createElement(s.InfoCard,{variant:l,title:u},e.createElement(s.ResponseErrorPanel,{error:m})):e.createElement(t.EntityTable,{title:u,variant:l,emptyContent:e.createElement("div",{style:{textAlign:"center"}},e.createElement(r.Z,{variant:"body1"},L),e.createElement(r.Z,{variant:"body2"},e.createElement(s.Link,{to:k},"Learn how to change this."))),columns:v,entities:H(K||[])})}const c=[t.EntityTable.columns.createEntityRefColumn({defaultKind:"component"}),t.EntityTable.columns.createOwnerColumn(),t.EntityTable.columns.createSpecTypeColumn(),t.EntityTable.columns.createSpecLifecycleColumn(),t.EntityTable.columns.createMetadataDescriptionColumn()],E="https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component",d=o=>o,p=[t.EntityTable.columns.createEntityRefColumn({defaultKind:"resource"}),t.EntityTable.columns.createOwnerColumn(),t.EntityTable.columns.createSpecTypeColumn(),t.EntityTable.columns.createSpecLifecycleColumn(),t.EntityTable.columns.createMetadataDescriptionColumn()],f="https://backstage.io/docs/features/software-catalog/descriptor-format#kind-resource",C=o=>o,T=[t.EntityTable.columns.createEntityRefColumn({defaultKind:"system"}),t.EntityTable.columns.createOwnerColumn(),t.EntityTable.columns.createMetadataDescriptionColumn()],R="https://backstage.io/docs/features/software-catalog/descriptor-format#kind-system",b=o=>o}}]);})();

//# sourceMappingURL=1553.09ef0e28.chunk.js.map