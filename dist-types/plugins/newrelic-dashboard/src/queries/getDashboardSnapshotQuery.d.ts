export declare const getDashboardSnapshotQuery = "mutation($guid: EntityGuid! , ,$duration: Milliseconds) {\n  dashboardCreateSnapshotUrl(guid: $guid , params: {timeWindow: {duration: $duration}})\n}";
