import gen from "../../ts/src/generator.ts";
import { ProtocolScriptRegExpList } from "../../../../.d.ts";
import getDeepTranslation from "../../../../utils/template-recursive.ts";

const tokens: ProtocolScriptRegExpList = [
  {
    open: false,
    reg: /(§{2}(endLine|endPonctuation)\d+§{2})\s*(§{2}string\d+§{2})/,
    id: (value, matches, typedExpressions, expressions) => {
      const id = `chainedString${gen.next().value}§§`;
      if (expressions) expressions[id] = value;
      return id;
    },
    close: false,
  },
];

export default tokens;
