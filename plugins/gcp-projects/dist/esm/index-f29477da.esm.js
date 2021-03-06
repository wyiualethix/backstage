import React, { useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { Grid, TextField, Button, makeStyles, LinearProgress, Table, Paper, TableBody, TableRow, TableCell, Typography, ButtonGroup, Tooltip } from '@material-ui/core';
import { HeaderLabel, Page, Header, Content, ContentHeader, SupportButton, InfoCard, SimpleStepper, SimpleStepperStep, StructuredMetadataTable, WarningPanel, Table as Table$1, Link as Link$1 } from '@backstage/core-components';
import { useRouteRef, useApi } from '@backstage/core-plugin-api';
import { r as rootRouteRef, g as gcpApiRef } from './index-f6e55b2c.esm.js';
import { useAsync, useMountEffect } from '@react-hookz/web';

const Project = () => {
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [disabled, setDisabled] = useState(true);
  const metadata = {
    ProjectName: projectName,
    ProjectId: projectId
  };
  return /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    spacing: 3
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 12,
    md: 6
  }, /* @__PURE__ */ React.createElement(InfoCard, {
    title: "Create new GCP Project"
  }, /* @__PURE__ */ React.createElement(SimpleStepper, null, /* @__PURE__ */ React.createElement(SimpleStepperStep, {
    title: "Project Name"
  }, /* @__PURE__ */ React.createElement(TextField, {
    variant: "outlined",
    name: "projectName",
    label: "Project Name",
    helperText: "The name of the new project.",
    inputProps: { "aria-label": "Project Name" },
    onChange: (e) => setProjectName(e.target.value),
    value: projectName,
    fullWidth: true
  })), /* @__PURE__ */ React.createElement(SimpleStepperStep, {
    title: "Project ID"
  }, /* @__PURE__ */ React.createElement(TextField, {
    variant: "outlined",
    name: "projectId",
    label: "projectId",
    onChange: (e) => setProjectId(e.target.value),
    value: projectId,
    fullWidth: true
  })), /* @__PURE__ */ React.createElement(SimpleStepperStep, {
    title: "Review",
    actions: {
      nextText: "Confirm",
      onNext: () => setDisabled(false)
    }
  }, /* @__PURE__ */ React.createElement(StructuredMetadataTable, {
    metadata
  }))), /* @__PURE__ */ React.createElement(Button, {
    component: Link,
    variant: "text",
    "data-testid": "cancel-button",
    color: "primary",
    to: "/gcp-projects"
  }, "Cancel"), /* @__PURE__ */ React.createElement(Button, {
    component: Link,
    variant: "contained",
    color: "primary",
    disabled,
    to: `newProject?projectName=${encodeURIComponent(projectName)},projectId=${encodeURIComponent(projectId)}`
  }, "Create")))));
};
const labels$2 = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(HeaderLabel, {
  label: "Owner",
  value: "Spotify"
}), /* @__PURE__ */ React.createElement(HeaderLabel, {
  label: "Lifecycle",
  value: "Production"
}));
const NewProjectPage = () => {
  const docsRootLink = useRouteRef(rootRouteRef)();
  return /* @__PURE__ */ React.createElement(Page, {
    themeId: "tool"
  }, /* @__PURE__ */ React.createElement(Header, {
    title: "New GCP Project",
    type: "GCP",
    typeLink: docsRootLink
  }, labels$2), /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(ContentHeader, {
    title: ""
  }, /* @__PURE__ */ React.createElement(SupportButton, null, "This plugin allows you to view and interact with your gcp projects.")), /* @__PURE__ */ React.createElement(Project, null)));
};

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 720,
    margin: theme.spacing(2)
  },
  title: {
    padding: theme.spacing(1, 0, 2, 0)
  },
  table: {
    padding: theme.spacing(1)
  }
}));
const DetailsPage = () => {
  const api = useApi(gcpApiRef);
  const classes = useStyles();
  const [{ status, result: details, error }, { execute }] = useAsync(async () => api.getProject(decodeURIComponent(location.search.split("projectId=")[1])));
  useMountEffect(execute);
  if (status === "loading") {
    return /* @__PURE__ */ React.createElement(LinearProgress, null);
  } else if (error) {
    return /* @__PURE__ */ React.createElement(WarningPanel, {
      title: "Failed to load project"
    }, error.toString());
  }
  const cloud_home_url = "https://console.cloud.google.com";
  return /* @__PURE__ */ React.createElement(Table, {
    component: Paper,
    className: classes.table
  }, /* @__PURE__ */ React.createElement(Table, null, /* @__PURE__ */ React.createElement(TableBody, null, /* @__PURE__ */ React.createElement(TableRow, null, /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(Typography, {
    noWrap: true
  }, "Name")), /* @__PURE__ */ React.createElement(TableCell, null, details == null ? void 0 : details.name)), /* @__PURE__ */ React.createElement(TableRow, null, /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(Typography, {
    noWrap: true
  }, "Project Number")), /* @__PURE__ */ React.createElement(TableCell, null, details == null ? void 0 : details.projectNumber)), /* @__PURE__ */ React.createElement(TableRow, null, /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(Typography, {
    noWrap: true
  }, "Project ID")), /* @__PURE__ */ React.createElement(TableCell, null, details == null ? void 0 : details.projectId)), /* @__PURE__ */ React.createElement(TableRow, null, /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(Typography, {
    noWrap: true
  }, "State")), /* @__PURE__ */ React.createElement(TableCell, null, details == null ? void 0 : details.lifecycleState)), /* @__PURE__ */ React.createElement(TableRow, null, /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(Typography, {
    noWrap: true
  }, "Creation Time")), /* @__PURE__ */ React.createElement(TableCell, null, details == null ? void 0 : details.createTime)), /* @__PURE__ */ React.createElement(TableRow, null, /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(Typography, {
    noWrap: true
  }, "Links")), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(ButtonGroup, {
    variant: "text",
    color: "primary",
    "aria-label": "text primary button group"
  }, (details == null ? void 0 : details.name) && /* @__PURE__ */ React.createElement(Button, null, /* @__PURE__ */ React.createElement("a", {
    href: `${cloud_home_url}/home/dashboard?project=${details.name}&supportedpurview=project`,
    target: "_blank",
    rel: "noreferrer noopener"
  }, "GCP")), (details == null ? void 0 : details.name) && /* @__PURE__ */ React.createElement(Button, null, /* @__PURE__ */ React.createElement("a", {
    href: `${cloud_home_url}/logs/query?project=${details.name}&supportedpurview=project`,
    target: "_blank",
    rel: "noreferrer noopener"
  }, "Logs"))))))));
};
const labels$1 = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(HeaderLabel, {
  label: "Owner",
  value: "Spotify"
}), /* @__PURE__ */ React.createElement(HeaderLabel, {
  label: "Lifecycle",
  value: "Production"
}));
const ProjectDetailsPage = () => {
  const docsRootLink = useRouteRef(rootRouteRef)();
  return /* @__PURE__ */ React.createElement(Page, {
    themeId: "service"
  }, /* @__PURE__ */ React.createElement(Header, {
    title: "GCP Project Details",
    type: "GCP",
    typeLink: docsRootLink
  }, labels$1), /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(ContentHeader, {
    title: ""
  }, /* @__PURE__ */ React.createElement(SupportButton, null, "Support Button")), /* @__PURE__ */ React.createElement(DetailsPage, null)));
};

const LongText = ({ text, max }) => {
  if (text.length < max) {
    return /* @__PURE__ */ React.createElement("span", null, text);
  }
  return /* @__PURE__ */ React.createElement(Tooltip, {
    title: text
  }, /* @__PURE__ */ React.createElement("span", null, text.slice(0, max), "..."));
};
const labels = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(HeaderLabel, {
  label: "Owner",
  value: "Spotify"
}), /* @__PURE__ */ React.createElement(HeaderLabel, {
  label: "Lifecycle",
  value: "Production"
}));
const PageContents = () => {
  const api = useApi(gcpApiRef);
  const [{ status, result, error }, { execute }] = useAsync(() => api.listProjects());
  useMountEffect(execute);
  if (status === "loading") {
    return /* @__PURE__ */ React.createElement(LinearProgress, null);
  } else if (error) {
    return /* @__PURE__ */ React.createElement(WarningPanel, {
      title: "Failed to load projects"
    }, error.toString());
  }
  function renderLink(id) {
    return /* @__PURE__ */ React.createElement(Link$1, {
      to: `project?projectId=${encodeURIComponent(id)}`
    }, /* @__PURE__ */ React.createElement(Typography, {
      color: "primary"
    }, /* @__PURE__ */ React.createElement(LongText, {
      text: id,
      max: 60
    })));
  }
  return /* @__PURE__ */ React.createElement("div", {
    style: { height: "95%", width: "100%" }
  }, /* @__PURE__ */ React.createElement(Table$1, {
    columns: [
      {
        field: "name",
        title: "Name",
        defaultSort: "asc"
      },
      {
        field: "projectNumber",
        title: "Project Number"
      },
      {
        field: "projectID",
        title: "Project ID",
        render: (rowData) => renderLink(rowData.id)
      },
      {
        field: "state",
        title: "State"
      },
      {
        field: "creationTime",
        title: "Creation Time"
      }
    ],
    data: (result == null ? void 0 : result.map((project) => ({
      id: project.projectId,
      name: project.name,
      projectNumber: (project == null ? void 0 : project.projectNumber) || "Error",
      projectID: project.projectId,
      state: (project == null ? void 0 : project.lifecycleState) || "Error",
      creationTime: (project == null ? void 0 : project.createTime) || "Error"
    }))) || [],
    options: {
      pageSize: 5,
      pageSizeOptions: [5, 10, 25, 50, 100]
    }
  }));
};
const ProjectListPage = () => /* @__PURE__ */ React.createElement(Page, {
  themeId: "service"
}, /* @__PURE__ */ React.createElement(Header, {
  title: "GCP Projects",
  type: "tool"
}, labels), /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(ContentHeader, {
  title: ""
}, /* @__PURE__ */ React.createElement(Button, {
  component: Link,
  variant: "contained",
  color: "primary",
  to: "new"
}, "New Project"), /* @__PURE__ */ React.createElement(SupportButton, null, "All your software catalog entities")), /* @__PURE__ */ React.createElement(PageContents, null)));

const GcpProjectsPage = () => /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, {
  path: "/",
  element: /* @__PURE__ */ React.createElement(ProjectListPage, null)
}), /* @__PURE__ */ React.createElement(Route, {
  path: "/new",
  element: /* @__PURE__ */ React.createElement(NewProjectPage, null)
}), /* @__PURE__ */ React.createElement(Route, {
  path: "/project",
  element: /* @__PURE__ */ React.createElement(ProjectDetailsPage, null)
}));

export { GcpProjectsPage };
//# sourceMappingURL=index-f29477da.esm.js.map
