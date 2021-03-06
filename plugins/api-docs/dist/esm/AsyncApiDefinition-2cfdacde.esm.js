import AsyncApi from '@asyncapi/react-component';
import '@asyncapi/react-component/styles/default.css';
import { makeStyles, alpha, darken } from '@material-ui/core/styles';
import React from 'react';
import { useTheme } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    fontFamily: "inherit",
    "& .bg-white": {
      background: "none"
    },
    "& .text-4xl": {
      ...theme.typography.h3
    },
    " & h2": {
      ...theme.typography.h4
    },
    "& .border": {
      borderColor: alpha(theme.palette.border, 0.1)
    },
    "& .min-w-min": {
      minWidth: "fit-content"
    },
    "& .examples": {
      padding: "1rem"
    },
    "& .bg-teal-500": {
      backgroundColor: theme.palette.status.ok
    },
    "& .bg-blue-500": {
      backgroundColor: theme.palette.info.main
    },
    "& .bg-blue-400": {
      backgroundColor: theme.palette.info.light
    },
    "& .bg-indigo-400": {
      backgroundColor: theme.palette.warning.main
    },
    "& .text-teal-50": {
      color: theme.palette.status.ok
    },
    "& .text-red-600": {
      color: theme.palette.error.main
    },
    "& .text-orange-600": {
      color: theme.palette.warning.main
    },
    "& .text-teal-500": {
      color: theme.palette.status.ok
    },
    "& .text-blue-500": {
      color: theme.palette.info.main
    },
    "& .-rotate-90": {
      "--tw-rotate": "0deg"
    },
    "& button": {
      ...theme.typography.button,
      borderRadius: theme.shape.borderRadius,
      color: theme.palette.primary.main
    },
    "& a": {
      color: theme.palette.link
    },
    "& a.no-underline": {
      ...theme.typography.button,
      background: "none",
      boxSizing: "border-box",
      minWidth: 64,
      borderRadius: theme.shape.borderRadius,
      transition: theme.transitions.create(["background-color", "box-shadow", "border"], {
        duration: theme.transitions.duration.short
      }),
      padding: "5px 15px",
      color: theme.palette.primary.main,
      border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
      "&:hover": {
        textDecoration: "none",
        border: `1px solid ${theme.palette.primary.main}`,
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity)
      }
    },
    "& li.no-underline": {
      "& a": {
        textDecoration: "none",
        color: theme.palette.getContrastText(theme.palette.primary.main)
      }
    }
  },
  dark: {
    "& svg": {
      fill: theme.palette.text.primary
    },
    "& .prose": {
      color: theme.palette.text.secondary,
      "& h3": {
        color: theme.palette.text.primary
      }
    },
    "& .bg-gray-100, .bg-gray-200": {
      backgroundColor: theme.palette.background.default
    },
    "& .text-gray-600": {
      color: theme.palette.grey["50"]
    },
    "& .text-gray-700": {
      color: theme.palette.grey["100"]
    },
    "& .panel--right": {
      background: darken(theme.palette.navigation.background, 0.1)
    },
    "& .examples": {
      backgroundColor: darken(theme.palette.navigation.background, 0.1),
      "& pre": {
        backgroundColor: darken(theme.palette.background.default, 0.2)
      }
    }
  }
}));
const fetchResolver = {
  order: 199,
  canRead: /^https?:\/\//,
  async read(file) {
    const response = await fetch(file.url);
    return response.text();
  }
};
const config = {
  parserOptions: {
    resolve: { fetch: fetchResolver }
  }
};
const AsyncApiDefinition = ({ definition }) => {
  const classes = useStyles();
  const theme = useTheme();
  const classNames = `${classes.root} ${theme.palette.type === "dark" ? classes.dark : ""}`;
  return /* @__PURE__ */ React.createElement("div", {
    className: classNames
  }, /* @__PURE__ */ React.createElement(AsyncApi, {
    schema: definition,
    config
  }));
};

export { AsyncApiDefinition };
//# sourceMappingURL=AsyncApiDefinition-2cfdacde.esm.js.map
