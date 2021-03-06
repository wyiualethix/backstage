import { createTheme as createTheme$1 } from '@material-ui/core/styles';
import { darken, lighten } from '@material-ui/core/styles/colorManipulator';
import { yellow } from '@material-ui/core/colors';

const shapes = {
  wave: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='1368' height='400' fill='none'%3e%3cmask id='a' width='1368' height='401' x='0' y='0' maskUnits='userSpaceOnUse'%3e%3cpath fill='url(%23paint0_linear)' d='M437 116C223 116 112 0 112 0h1256v400c-82 0-225-21-282-109-112-175-436-175-649-175z'/%3e%3cpath fill='url(%23paint1_linear)' d='M1368 400V282C891-29 788 40 711 161 608 324 121 372 0 361v39h1368z'/%3e%3cpath fill='url(%23paint2_linear)' d='M1368 244v156H0V94c92-24 198-46 375 0l135 41c176 51 195 109 858 109z'/%3e%3cpath fill='url(%23paint3_linear)' d='M1252 400h116c-14-7-35-14-116-16-663-14-837-128-1013-258l-85-61C98 28 46 8 0 0v400h1252z'/%3e%3c/mask%3e%3cg mask='url(%23a)'%3e%3cpath fill='white' d='M-172-98h1671v601H-172z'/%3e%3c/g%3e%3cdefs%3e%3clinearGradient id='paint0_linear' x1='602' x2='1093.5' y1='-960.5' y2='272' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='white'/%3e%3cstop offset='1' stop-color='white' stop-opacity='0'/%3e%3c/linearGradient%3e%3clinearGradient id='paint1_linear' x1='482' x2='480' y1='1058.5' y2='70.5' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='white'/%3e%3cstop offset='1' stop-color='white' stop-opacity='0'/%3e%3c/linearGradient%3e%3clinearGradient id='paint2_linear' x1='424' x2='446.1' y1='-587.5' y2='274.6' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='white'/%3e%3cstop offset='1' stop-color='white' stop-opacity='0'/%3e%3c/linearGradient%3e%3clinearGradient id='paint3_linear' x1='587' x2='349' y1='-1120.5' y2='341' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='white'/%3e%3cstop offset='1' stop-color='white' stop-opacity='0'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e")`,
  wave2: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='1368' height='400' fill='none'%3e%3cmask id='a' width='1764' height='479' x='-229' y='-6' maskUnits='userSpaceOnUse'%3e%3cpath fill='url(%23paint0_linear)' d='M0 400h1350C1321 336 525 33 179-2c-345-34-395 236-408 402H0z'/%3e%3cpath fill='url(%23paint1_linear)' d='M1378 177v223H0V217s219 75 327 52C436 246 717-35 965 45s254 144 413 132z'/%3e%3cpath fill='url(%23paint2_linear)' d='M26 400l-78-16c-170 205-44-6-137-30l-4-1 4 1 137 30c37-45 89-110 159-201 399-514-45 238 1176-50 275-65 354-39 91 267H26z'/%3e%3c/mask%3e%3cg mask='url(%23a)'%3e%3cpath fill='white' d='M0 0h1368v400H0z'/%3e%3c/g%3e%3cdefs%3e%3clinearGradient id='paint0_linear' x1='431' x2='397.3' y1='-599' y2='372.8' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='white'/%3e%3cstop offset='1' stop-color='white' stop-opacity='0'/%3e%3c/linearGradient%3e%3clinearGradient id='paint1_linear' x1='236.5' x2='446.6' y1='-586' y2='381.5' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='white'/%3e%3cstop offset='1' stop-color='white' stop-opacity='0'/%3e%3c/linearGradient%3e%3clinearGradient id='paint2_linear' x1='851.8' x2='640.4' y1='-867.2' y2='363.7' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='white'/%3e%3cstop offset='1' stop-color='white' stop-opacity='0'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e")`,
  round: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='1368' height='400' fill='none'%3e%3cmask id='a' width='2269' height='1408' x='-610' y='-509' maskUnits='userSpaceOnUse'%3e%3ccircle cx='1212.8' cy='74.8' r='317.5' fill='url(%23paint0_linear)' transform='rotate(-52 1213 75)'/%3e%3ccircle cx='737.8' cy='445.8' r='317.5' fill='url(%23paint1_linear)' transform='rotate(-116 738 446)'/%3e%3ccircle cx='601.8' cy='52.8' r='418.6' fill='url(%23paint2_linear)' transform='rotate(-117 602 53)'/%3e%3ccircle cx='999.8' cy='364' r='389.1' fill='url(%23paint3_linear)' transform='rotate(31 1000 364)'/%3e%3cellipse cx='-109.2' cy='263.5' fill='url(%23paint4_linear)' rx='429.2' ry='465.8' transform='rotate(-85 -109 264)'/%3e%3c/mask%3e%3cg mask='url(%23a)'%3e%3cpath fill='white' d='M0 0h1368v400H0z'/%3e%3c/g%3e%3cdefs%3e%3clinearGradient id='paint0_linear' x1='1301.2' x2='161.4' y1='-1879.7' y2='-969.6' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='white'/%3e%3cstop offset='1' stop-color='white' stop-opacity='0'/%3e%3c/linearGradient%3e%3clinearGradient id='paint1_linear' x1='826.2' x2='-313.6' y1='-1508.7' y2='-598.6' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='white'/%3e%3cstop offset='1' stop-color='white' stop-opacity='0'/%3e%3c/linearGradient%3e%3clinearGradient id='paint2_linear' x1='718.4' x2='-784.3' y1='-2524' y2='-1324.2' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='white'/%3e%3cstop offset='1' stop-color='white' stop-opacity='0'/%3e%3c/linearGradient%3e%3clinearGradient id='paint3_linear' x1='1108.2' x2='-288.6' y1='-2031.1' y2='-915.9' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='white'/%3e%3cstop offset='1' stop-color='white' stop-opacity='0'/%3e%3c/linearGradient%3e%3clinearGradient id='paint4_linear' x1='10.4' x2='-1626.5' y1='-2603.8' y2='-1399.5' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='white'/%3e%3cstop offset='1' stop-color='white' stop-opacity='0'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e")`
};
const colorVariants = {
  darkGrey: ["#171717", "#383838"],
  marineBlue: ["#006D8F", "#0049A1"],
  veryBlue: ["#0027AF", "#270094"],
  rubyRed: ["#98002B", "#8D1134"],
  toastyOrange: ["#BE2200", "#A41D00"],
  purpleSky: ["#8912CA", "#3E00EA"],
  eveningSea: ["#00FFF2", "#035355"],
  teal: ["#005B4B"],
  pinkSea: ["#C8077A", "#C2297D"]
};
function genPageTheme(colors, shape) {
  const gradientColors = colors.length === 1 ? [colors[0], colors[0]] : colors;
  const gradient = `linear-gradient(90deg, ${gradientColors.join(", ")})`;
  const backgroundImage = `${shape},  ${gradient}`;
  return { colors, shape, backgroundImage };
}
const pageTheme = {
  home: genPageTheme(colorVariants.teal, shapes.wave),
  documentation: genPageTheme(colorVariants.pinkSea, shapes.wave2),
  tool: genPageTheme(colorVariants.purpleSky, shapes.round),
  service: genPageTheme(colorVariants.marineBlue, shapes.wave),
  website: genPageTheme(colorVariants.veryBlue, shapes.wave),
  library: genPageTheme(colorVariants.rubyRed, shapes.wave),
  other: genPageTheme(colorVariants.darkGrey, shapes.wave),
  app: genPageTheme(colorVariants.toastyOrange, shapes.wave),
  apis: genPageTheme(colorVariants.teal, shapes.wave2)
};

const DEFAULT_FONT_FAMILY = '"Helvetica Neue", Helvetica, Roboto, Arial, sans-serif';
function createThemeOptions(options) {
  const {
    palette,
    fontFamily = DEFAULT_FONT_FAMILY,
    defaultPageTheme,
    pageTheme: pageTheme$1 = pageTheme
  } = options;
  if (!pageTheme$1[defaultPageTheme]) {
    throw new Error(`${defaultPageTheme} is not defined in pageTheme.`);
  }
  return {
    palette,
    props: {
      MuiGrid: {
        spacing: 2
      },
      MuiSwitch: {
        color: "primary"
      }
    },
    typography: {
      fontFamily,
      h5: {
        fontWeight: 700
      },
      h4: {
        fontWeight: 700,
        fontSize: 28,
        marginBottom: 6
      },
      h3: {
        fontSize: 32,
        fontWeight: 700,
        marginBottom: 6
      },
      h2: {
        fontSize: 40,
        fontWeight: 700,
        marginBottom: 8
      },
      h1: {
        fontSize: 54,
        fontWeight: 700,
        marginBottom: 10
      }
    },
    page: pageTheme$1[defaultPageTheme],
    getPageTheme: ({ themeId }) => {
      var _a;
      return (_a = pageTheme$1[themeId]) != null ? _a : pageTheme$1[defaultPageTheme];
    }
  };
}
function createThemeOverrides(theme) {
  return {
    MuiCssBaseline: {
      "@global": {
        html: {
          height: "100%",
          fontFamily: theme.typography.fontFamily
        },
        body: {
          height: "100%",
          fontFamily: theme.typography.fontFamily,
          "overscroll-behavior-y": "none"
        },
        a: {
          color: "inherit",
          textDecoration: "none"
        }
      }
    },
    MuiTableRow: {
      root: {
        "&:nth-of-type(odd)": {
          backgroundColor: theme.palette.background.default
        }
      },
      hover: {
        "&:hover": {
          cursor: "pointer"
        }
      },
      head: {
        "&:nth-of-type(odd)": {
          backgroundColor: theme.palette.background.paper
        }
      }
    },
    MuiTableCell: {
      root: {
        wordBreak: "break-word",
        overflow: "hidden",
        verticalAlign: "middle",
        lineHeight: "1",
        margin: 0,
        padding: theme.spacing(3, 2, 3, 2.5),
        borderBottom: 0
      },
      sizeSmall: {
        padding: theme.spacing(1.5, 2, 1.5, 2.5)
      },
      head: {
        wordBreak: "break-word",
        overflow: "hidden",
        color: "rgb(179, 179, 179)",
        fontWeight: "normal",
        lineHeight: "1"
      }
    },
    MuiTabs: {
      root: {
        minHeight: 24
      }
    },
    MuiTab: {
      root: {
        color: theme.palette.link,
        minHeight: 24,
        textTransform: "initial",
        letterSpacing: "0.07em",
        "&:hover": {
          color: darken(theme.palette.link, 0.3),
          background: lighten(theme.palette.link, 0.95)
        },
        [theme.breakpoints.up("md")]: {
          minWidth: 120,
          fontSize: theme.typography.pxToRem(14),
          fontWeight: 500
        }
      },
      textColorPrimary: {
        color: theme.palette.link
      }
    },
    MuiTableSortLabel: {
      root: {
        color: "inherit",
        "&:hover": {
          color: "inherit"
        },
        "&:focus": {
          color: "inherit"
        }
      },
      active: {
        fontWeight: "bold",
        color: "inherit"
      }
    },
    MuiListItemText: {
      dense: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    },
    MuiButton: {
      text: {
        padding: void 0
      }
    },
    MuiChip: {
      root: {
        backgroundColor: "#D9D9D9",
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        color: theme.palette.grey[900]
      },
      outlined: {
        color: theme.palette.text.primary
      },
      label: {
        lineHeight: `${theme.spacing(2.5)}px`,
        fontWeight: theme.typography.fontWeightMedium,
        fontSize: `${theme.spacing(1.75)}px`
      },
      labelSmall: {
        fontSize: `${theme.spacing(1.5)}px`
      },
      deleteIcon: {
        color: theme.palette.grey[500],
        width: `${theme.spacing(3)}px`,
        height: `${theme.spacing(3)}px`,
        margin: `0 ${theme.spacing(0.75)}px 0 -${theme.spacing(0.75)}px`
      },
      deleteIconSmall: {
        width: `${theme.spacing(2)}px`,
        height: `${theme.spacing(2)}px`,
        margin: `0 ${theme.spacing(0.5)}px 0 -${theme.spacing(0.5)}px`
      }
    },
    MuiCard: {
      root: {
        display: "flex",
        flexDirection: "column"
      }
    },
    MuiCardHeader: {
      root: {
        paddingBottom: 0
      }
    },
    MuiCardContent: {
      root: {
        flexGrow: 1,
        "&:last-child": {
          paddingBottom: void 0
        }
      }
    },
    MuiCardActions: {
      root: {
        justifyContent: "flex-end"
      }
    }
  };
}
function createTheme(options) {
  const themeOptions = createThemeOptions(options);
  const baseTheme = createTheme$1(themeOptions);
  const overrides = createThemeOverrides(baseTheme);
  const theme = { ...baseTheme, overrides };
  return theme;
}

const lightTheme = createTheme({
  palette: {
    type: "light",
    background: {
      default: "#F8F8F8"
    },
    status: {
      ok: "#1DB954",
      warning: "#FF9800",
      error: "#E22134",
      running: "#2E77D0",
      pending: "#FFED51",
      aborted: "#757575"
    },
    bursts: {
      fontColor: "#FEFEFE",
      slackChannelText: "#ddd",
      backgroundColor: {
        default: "#7C3699"
      },
      gradient: {
        linear: "linear-gradient(-137deg, #4BB8A5 0%, #187656 100%)"
      }
    },
    primary: {
      main: "#2E77D0"
    },
    banner: {
      info: "#2E77D0",
      error: "#E22134",
      text: "#FFFFFF",
      link: "#000000",
      warning: "#FF9800"
    },
    border: "#E6E6E6",
    textContrast: "#000000",
    textVerySubtle: "#DDD",
    textSubtle: "#6E6E6E",
    highlight: "#FFFBCC",
    errorBackground: "#FFEBEE",
    warningBackground: "#F59B23",
    infoBackground: "#ebf5ff",
    errorText: "#CA001B",
    infoText: "#004e8a",
    warningText: "#000000",
    linkHover: "#2196F3",
    link: "#0A6EBE",
    gold: yellow.A700,
    navigation: {
      background: "#171717",
      indicator: "#9BF0E1",
      color: "#b5b5b5",
      selectedColor: "#FFF",
      navItem: {
        hoverBackground: "#404040"
      },
      submenu: {
        background: "#404040"
      }
    },
    pinSidebarButton: {
      icon: "#181818",
      background: "#BDBDBD"
    },
    tabbar: {
      indicator: "#9BF0E1"
    }
  },
  defaultPageTheme: "home",
  pageTheme
});
const darkTheme = createTheme({
  palette: {
    type: "dark",
    background: {
      default: "#333333"
    },
    status: {
      ok: "#71CF88",
      warning: "#FFB84D",
      error: "#F84C55",
      running: "#3488E3",
      pending: "#FEF071",
      aborted: "#9E9E9E"
    },
    bursts: {
      fontColor: "#FEFEFE",
      slackChannelText: "#ddd",
      backgroundColor: {
        default: "#7C3699"
      },
      gradient: {
        linear: "linear-gradient(-137deg, #4BB8A5 0%, #187656 100%)"
      }
    },
    primary: {
      main: "#9CC9FF",
      dark: "#82BAFD"
    },
    secondary: {
      main: "#FF88B2"
    },
    banner: {
      info: "#2E77D0",
      error: "#E22134",
      text: "#FFFFFF",
      link: "#000000",
      warning: "#FF9800"
    },
    border: "#E6E6E6",
    textContrast: "#FFFFFF",
    textVerySubtle: "#727272",
    textSubtle: "#CCCCCC",
    highlight: "#FFFBCC",
    errorBackground: "#FFEBEE",
    warningBackground: "#F59B23",
    infoBackground: "#ebf5ff",
    errorText: "#CA001B",
    infoText: "#004e8a",
    warningText: "#000000",
    linkHover: "#82BAFD",
    link: "#9CC9FF",
    gold: yellow.A700,
    navigation: {
      background: "#424242",
      indicator: "#9BF0E1",
      color: "#b5b5b5",
      selectedColor: "#FFF",
      navItem: {
        hoverBackground: "#404040"
      },
      submenu: {
        background: "#404040"
      }
    },
    pinSidebarButton: {
      icon: "#404040",
      background: "#BDBDBD"
    },
    tabbar: {
      indicator: "#9BF0E1"
    }
  },
  defaultPageTheme: "home",
  pageTheme
});

export { colorVariants, createTheme, createThemeOptions, createThemeOverrides, darkTheme, genPageTheme, lightTheme, pageTheme, shapes };
//# sourceMappingURL=index.esm.js.map
