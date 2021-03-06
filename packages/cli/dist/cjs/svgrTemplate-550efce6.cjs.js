'use strict';

function svgrTemplate({ imports, interfaces, componentName, props, jsx }, { tpl }) {
  const name = `${componentName.replace(/icon$/, "")}Icon`;
  const defaultExport = {
    type: "ExportDefaultDeclaration",
    declaration: { type: "Identifier", name }
  };
  return tpl`
${imports}
import SvgIcon from '@material-ui/core/SvgIcon';

${interfaces}

const ${name} = (${props}) => React.createElement(SvgIcon, ${props}, ${jsx.children});

${defaultExport}`;
}

exports.svgrTemplate = svgrTemplate;
//# sourceMappingURL=svgrTemplate-550efce6.cjs.js.map
