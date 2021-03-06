import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import CopyIcon from '@material-ui/icons/FileCopy';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import ansiRegexMaker from 'ansi-regex';
import { makeStyles, alpha } from '@material-ui/core/styles';
import * as colors from '@material-ui/core/colors';
import classNames from 'classnames';
import startCase from 'lodash/startCase';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import FilterList from '@material-ui/icons/FilterList';
import { useToggle } from '@react-hookz/web';
import { useApi, errorApiRef } from '@backstage/core-plugin-api';
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard';

const ansiRegex = ansiRegexMaker();
const newlineRegex = /\n\r?/g;
const codeModifiers = Object.fromEntries(Object.entries({
  1: (m) => ({ ...m, bold: true }),
  3: (m) => ({ ...m, italic: true }),
  4: (m) => ({ ...m, underline: true }),
  22: ({ bold: _, ...m }) => m,
  23: ({ italic: _, ...m }) => m,
  24: ({ underline: _, ...m }) => m,
  30: (m) => ({ ...m, foreground: "black" }),
  31: (m) => ({ ...m, foreground: "red" }),
  32: (m) => ({ ...m, foreground: "green" }),
  33: (m) => ({ ...m, foreground: "yellow" }),
  34: (m) => ({ ...m, foreground: "blue" }),
  35: (m) => ({ ...m, foreground: "magenta" }),
  36: (m) => ({ ...m, foreground: "cyan" }),
  37: (m) => ({ ...m, foreground: "white" }),
  39: ({ foreground: _, ...m }) => m,
  90: (m) => ({ ...m, foreground: "grey" }),
  40: (m) => ({ ...m, background: "black" }),
  41: (m) => ({ ...m, background: "red" }),
  42: (m) => ({ ...m, background: "green" }),
  43: (m) => ({ ...m, background: "yellow" }),
  44: (m) => ({ ...m, background: "blue" }),
  45: (m) => ({ ...m, background: "magenta" }),
  46: (m) => ({ ...m, background: "cyan" }),
  47: (m) => ({ ...m, background: "white" }),
  49: ({ background: _, ...m }) => m
}).map(([code, modifier]) => [`\x1B[${code}m`, modifier]));
class AnsiLine {
  constructor(lineNumber = 1, chunks = []) {
    this.lineNumber = lineNumber;
    this.chunks = chunks;
    this.text = chunks.map((c) => c.text).join("").toLocaleLowerCase("en-US");
  }
  lastChunk() {
    return this.chunks[this.chunks.length - 1];
  }
  replaceLastChunk(newChunks) {
    if (newChunks) {
      this.chunks.splice(this.chunks.length - 1, 1, ...newChunks);
      this.text = this.chunks.map((c) => c.text).join("").toLocaleLowerCase("en-US");
    }
  }
}
class AnsiProcessor {
  constructor() {
    this.text = "";
    this.lines = [];
    this.processLines = (text, modifiers = {}, startingLineNumber = 1) => {
      var _a;
      const lines = [];
      let currentModifiers = modifiers;
      let currentLineNumber = startingLineNumber;
      let prevIndex = 0;
      newlineRegex.lastIndex = 0;
      for (; ; ) {
        const match = newlineRegex.exec(text);
        if (!match) {
          const chunks2 = this.processText(text.slice(prevIndex), currentModifiers);
          lines.push(new AnsiLine(currentLineNumber, chunks2));
          return lines;
        }
        const line = text.slice(prevIndex, match.index);
        prevIndex = match.index + match[0].length;
        const chunks = this.processText(line, currentModifiers);
        lines.push(new AnsiLine(currentLineNumber, chunks));
        currentModifiers = (_a = chunks[chunks.length - 1].modifiers) != null ? _a : currentModifiers;
        currentLineNumber += 1;
      }
    };
    this.processText = (fullText, modifiers) => {
      const chunks = [];
      let currentModifiers = modifiers;
      let prevIndex = 0;
      ansiRegex.lastIndex = 0;
      for (; ; ) {
        const match = ansiRegex.exec(fullText);
        if (!match) {
          chunks.push({
            text: fullText.slice(prevIndex),
            modifiers: currentModifiers
          });
          return chunks;
        }
        const text = fullText.slice(prevIndex, match.index);
        chunks.push({ text, modifiers: currentModifiers });
        prevIndex = match.index + match[0].length;
        currentModifiers = this.processCode(match[0], currentModifiers);
      }
    };
    this.processCode = (code, modifiers) => {
      var _a, _b;
      return (_b = (_a = codeModifiers[code]) == null ? void 0 : _a.call(codeModifiers, modifiers)) != null ? _b : modifiers;
    };
  }
  process(text) {
    var _a, _b, _c;
    if (this.text === text) {
      return this.lines;
    }
    if (text.startsWith(this.text)) {
      const lastLineIndex = this.lines.length > 0 ? this.lines.length - 1 : 0;
      const lastLine = (_a = this.lines[lastLineIndex]) != null ? _a : new AnsiLine();
      const lastChunk = lastLine.lastChunk();
      const newLines = this.processLines(((_b = lastChunk == null ? void 0 : lastChunk.text) != null ? _b : "") + text.slice(this.text.length), lastChunk == null ? void 0 : lastChunk.modifiers, lastLine == null ? void 0 : lastLine.lineNumber);
      lastLine.replaceLastChunk((_c = newLines[0]) == null ? void 0 : _c.chunks);
      this.lines[lastLineIndex] = lastLine;
      this.lines.push(...newLines.slice(1));
    } else {
      this.lines = this.processLines(text);
    }
    this.text = text;
    return this.lines;
  }
}

const HEADER_SIZE = 40;
const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper
  },
  header: {
    height: HEADER_SIZE,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  log: {
    fontFamily: '"Monaco", monospace',
    fontSize: theme.typography.pxToRem(12)
  },
  line: {
    position: "relative",
    whiteSpace: "pre",
    "&:hover": {
      background: theme.palette.action.hover
    }
  },
  lineSelected: {
    background: theme.palette.action.selected,
    "&:hover": {
      background: theme.palette.action.selected
    }
  },
  lineCopyButton: {
    position: "absolute",
    paddingTop: 0,
    paddingBottom: 0
  },
  lineNumber: {
    display: "inline-block",
    textAlign: "end",
    width: 60,
    marginRight: theme.spacing(1),
    cursor: "pointer"
  },
  textHighlight: {
    background: alpha(theme.palette.info.main, 0.15)
  },
  textSelectedHighlight: {
    background: alpha(theme.palette.info.main, 0.4)
  },
  modifierBold: {
    fontWeight: theme.typography.fontWeightBold
  },
  modifierItalic: {
    fontStyle: "italic"
  },
  modifierUnderline: {
    textDecoration: "underline"
  },
  modifierForegroundBlack: {
    color: colors.common.black
  },
  modifierForegroundRed: {
    color: colors.red[500]
  },
  modifierForegroundGreen: {
    color: colors.green[500]
  },
  modifierForegroundYellow: {
    color: colors.yellow[500]
  },
  modifierForegroundBlue: {
    color: colors.blue[500]
  },
  modifierForegroundMagenta: {
    color: colors.purple[500]
  },
  modifierForegroundCyan: {
    color: colors.cyan[500]
  },
  modifierForegroundWhite: {
    color: colors.common.white
  },
  modifierForegroundGrey: {
    color: colors.grey[500]
  },
  modifierBackgroundBlack: {
    background: colors.common.black
  },
  modifierBackgroundRed: {
    background: colors.red[500]
  },
  modifierBackgroundGreen: {
    background: colors.green[500]
  },
  modifierBackgroundYellow: {
    background: colors.yellow[500]
  },
  modifierBackgroundBlue: {
    background: colors.blue[500]
  },
  modifierBackgroundMagenta: {
    background: colors.purple[500]
  },
  modifierBackgroundCyan: {
    background: colors.cyan[500]
  },
  modifierBackgroundWhite: {
    background: colors.common.white
  },
  modifierBackgroundGrey: {
    background: colors.grey[500]
  }
}), { name: "BackstageLogViewer" });

function getModifierClasses(classes, modifiers) {
  const classNames = new Array();
  if (modifiers.bold) {
    classNames.push(classes.modifierBold);
  }
  if (modifiers.italic) {
    classNames.push(classes.modifierItalic);
  }
  if (modifiers.underline) {
    classNames.push(classes.modifierUnderline);
  }
  if (modifiers.foreground) {
    const key = `modifierForeground${startCase(modifiers.foreground)}`;
    classNames.push(classes[key]);
  }
  if (modifiers.background) {
    const key = `modifierBackground${startCase(modifiers.background)}`;
    classNames.push(classes[key]);
  }
  return classNames.length > 0 ? classNames.join(" ") : void 0;
}
function findSearchResults(text, searchText) {
  if (!searchText || !text.includes(searchText)) {
    return void 0;
  }
  const searchResults = new Array();
  let offset = 0;
  for (; ; ) {
    const start = text.indexOf(searchText, offset);
    if (start === -1) {
      break;
    }
    const end = start + searchText.length;
    searchResults.push({ start, end });
    offset = end;
  }
  return searchResults;
}
function calculateHighlightedChunks(line, searchText) {
  const results = findSearchResults(line.text, searchText);
  if (!results) {
    return line.chunks;
  }
  const chunks = new Array();
  let lineOffset = 0;
  let resultIndex = 0;
  let result = results[resultIndex];
  for (const chunk of line.chunks) {
    const { text, modifiers } = chunk;
    if (!result || lineOffset + text.length < result.start) {
      chunks.push(chunk);
      lineOffset += text.length;
      continue;
    }
    let localOffset = 0;
    while (result) {
      const localStart = Math.max(result.start - lineOffset, 0);
      if (localStart > text.length) {
        break;
      }
      const localEnd = Math.min(result.end - lineOffset, text.length);
      const hasTextBeforeResult = localStart > localOffset;
      if (hasTextBeforeResult) {
        chunks.push({ text: text.slice(localOffset, localStart), modifiers });
      }
      const hasResultText = localEnd > localStart;
      if (hasResultText) {
        chunks.push({
          modifiers,
          highlight: resultIndex,
          text: text.slice(localStart, localEnd)
        });
      }
      localOffset = localEnd;
      const foundCompleteResult = result.end - lineOffset === localEnd;
      if (foundCompleteResult) {
        resultIndex += 1;
        result = results[resultIndex];
      } else {
        break;
      }
    }
    const hasTextAfterResult = localOffset < text.length;
    if (hasTextAfterResult) {
      chunks.push({ text: text.slice(localOffset), modifiers });
    }
    lineOffset += text.length;
  }
  return chunks;
}
function LogLine({
  line,
  classes,
  searchText,
  highlightResultIndex
}) {
  const chunks = useMemo(() => calculateHighlightedChunks(line, searchText), [line, searchText]);
  const elements = useMemo(() => chunks.map(({ text, modifiers, highlight }, index) => /* @__PURE__ */ React.createElement("span", {
    key: index,
    className: classNames(getModifierClasses(classes, modifiers), highlight !== void 0 && (highlight === highlightResultIndex ? classes.textSelectedHighlight : classes.textHighlight))
  }, text)), [chunks, highlightResultIndex, classes]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, elements);
}

function LogViewerControls(props) {
  var _a;
  const { resultCount, resultIndexStep, toggleShouldFilter } = props;
  const resultIndex = (_a = props.resultIndex) != null ? _a : 0;
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        toggleShouldFilter();
      } else {
        resultIndexStep(event.shiftKey);
      }
    }
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, resultCount !== void 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(IconButton, {
    size: "small",
    onClick: () => resultIndexStep(true)
  }, /* @__PURE__ */ React.createElement(ChevronLeftIcon, null)), /* @__PURE__ */ React.createElement(Typography, null, Math.min(resultIndex + 1, resultCount), "/", resultCount), /* @__PURE__ */ React.createElement(IconButton, {
    size: "small",
    onClick: () => resultIndexStep()
  }, /* @__PURE__ */ React.createElement(ChevronRight, null))), /* @__PURE__ */ React.createElement(TextField, {
    size: "small",
    variant: "standard",
    placeholder: "Search",
    value: props.searchInput,
    onKeyPress: handleKeyPress,
    onChange: (e) => props.setSearchInput(e.target.value)
  }), /* @__PURE__ */ React.createElement(IconButton, {
    size: "small",
    onClick: toggleShouldFilter
  }, props.shouldFilter ? /* @__PURE__ */ React.createElement(FilterList, {
    color: "primary"
  }) : /* @__PURE__ */ React.createElement(FilterList, {
    color: "disabled"
  })));
}

function applySearchFilter(lines, searchText) {
  if (!searchText) {
    return { lines };
  }
  const matchingLines = [];
  const searchResults = [];
  for (const line of lines) {
    if (line.text.includes(searchText)) {
      matchingLines.push(line);
      let offset = 0;
      let lineResultIndex = 0;
      for (; ; ) {
        const start = line.text.indexOf(searchText, offset);
        if (start === -1) {
          break;
        }
        searchResults.push({
          lineNumber: line.lineNumber,
          lineIndex: lineResultIndex++
        });
        offset = start + searchText.length;
      }
    }
  }
  return {
    lines: matchingLines,
    results: searchResults
  };
}
function useLogViewerSearch(lines) {
  var _a;
  const [searchInput, setSearchInput] = useState("");
  const searchText = searchInput.toLocaleLowerCase("en-US");
  const [resultIndex, setResultIndex] = useState(0);
  const [shouldFilter, toggleShouldFilter] = useToggle(false);
  const filter = useMemo(() => applySearchFilter(lines, searchText), [lines, searchText]);
  const searchResult = filter.results ? filter.results[Math.min(resultIndex, filter.results.length - 1)] : void 0;
  const resultCount = (_a = filter.results) == null ? void 0 : _a.length;
  const resultIndexStep = (decrement) => {
    if (decrement) {
      if (resultCount !== void 0) {
        const next = Math.min(resultIndex - 1, resultCount - 2);
        setResultIndex(next < 0 ? resultCount - 1 : next);
      }
    } else {
      if (resultCount !== void 0) {
        const next = resultIndex + 1;
        setResultIndex(next >= resultCount ? 0 : next);
      }
    }
  };
  return {
    lines: shouldFilter ? filter.lines : lines,
    searchText,
    searchInput,
    setSearchInput,
    shouldFilter,
    toggleShouldFilter,
    resultCount,
    resultIndex,
    resultIndexStep,
    resultLine: searchResult == null ? void 0 : searchResult.lineNumber,
    resultLineIndex: searchResult == null ? void 0 : searchResult.lineIndex
  };
}

function useLogViewerSelection(lines) {
  const errorApi = useApi(errorApiRef);
  const [sel, setSelection] = useState();
  const start = sel ? Math.min(sel.start, sel.end) : void 0;
  const end = sel ? Math.max(sel.start, sel.end) : void 0;
  const [{ error }, copyToClipboard] = useCopyToClipboard();
  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);
  return {
    shouldShowButton(line) {
      return start === line || end === line;
    },
    isSelected(line) {
      if (!sel) {
        return false;
      }
      return start <= line && line <= end;
    },
    setSelection(line, add) {
      if (add) {
        setSelection((s) => s ? { start: s.start, end: line } : { start: line, end: line });
      } else {
        setSelection((s) => (s == null ? void 0 : s.start) === line && (s == null ? void 0 : s.end) === line ? void 0 : { start: line, end: line });
      }
    },
    copySelection() {
      if (sel) {
        const copyText = lines.slice(Math.min(sel.start, sel.end) - 1, Math.max(sel.start, sel.end)).map((l) => l.chunks.map((c) => c.text).join("")).join("\n");
        copyToClipboard(copyText);
        setSelection(void 0);
      }
    }
  };
}

function RealLogViewer(props) {
  const classes = useStyles({ classes: props.classes });
  const listRef = useRef(null);
  const processor = useMemo(() => new AnsiProcessor(), []);
  const lines = processor.process(props.text);
  const search = useLogViewerSearch(lines);
  const selection = useLogViewerSelection(lines);
  const location = useLocation();
  useEffect(() => {
    if (search.resultLine !== void 0 && listRef.current) {
      listRef.current.scrollToItem(search.resultLine - 1, "center");
    }
  }, [search.resultLine]);
  useEffect(() => {
    if (location.hash) {
      const line = parseInt(location.hash.replace(/\D/g, ""), 10);
      selection.setSelection(line, false);
    }
  }, []);
  const handleSelectLine = (line, event) => {
    selection.setSelection(line, event.shiftKey);
  };
  return /* @__PURE__ */ React.createElement(AutoSizer, null, ({ height, width }) => /* @__PURE__ */ React.createElement("div", {
    style: { width, height },
    className: classes.root
  }, /* @__PURE__ */ React.createElement("div", {
    className: classes.header
  }, /* @__PURE__ */ React.createElement(LogViewerControls, {
    ...search
  })), /* @__PURE__ */ React.createElement(FixedSizeList, {
    ref: listRef,
    className: classes.log,
    height: height - HEADER_SIZE,
    width,
    itemData: search.lines,
    itemSize: 20,
    itemCount: search.lines.length
  }, ({ index, style, data }) => {
    const line = data[index];
    const { lineNumber } = line;
    return /* @__PURE__ */ React.createElement("div", {
      style: { ...style },
      className: classNames(classes.line, {
        [classes.lineSelected]: selection.isSelected(lineNumber)
      })
    }, selection.shouldShowButton(lineNumber) && /* @__PURE__ */ React.createElement(IconButton, {
      "data-testid": "copy-button",
      size: "small",
      className: classes.lineCopyButton,
      onClick: () => selection.copySelection()
    }, /* @__PURE__ */ React.createElement(CopyIcon, {
      fontSize: "inherit"
    })), /* @__PURE__ */ React.createElement("a", {
      role: "row",
      target: "_self",
      href: `#line-${lineNumber}`,
      className: classes.lineNumber,
      onClick: (event) => handleSelectLine(lineNumber, event),
      onKeyPress: (event) => handleSelectLine(lineNumber, event)
    }, lineNumber), /* @__PURE__ */ React.createElement(LogLine, {
      line,
      classes,
      searchText: search.searchText,
      highlightResultIndex: search.resultLine === lineNumber ? search.resultLineIndex : void 0
    }));
  })));
}

export { RealLogViewer };
//# sourceMappingURL=RealLogViewer-5b0c3451.esm.js.map
