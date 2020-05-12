const SyntaxClickError = new SyntaxError('[Ogone]  wrong syntax of --click directive. it should be: --click:case');
export default function parseDirectives(node, opts) {
  let result = '';
  const { nodeIsDynamic } = opts;
  if (nodeIsDynamic) {
    const { attributes } = node;
    const keys = Object.keys(attributes);
    result += `${node.id}.directives = [];`
    for (let key of keys) {
        switch(true) {
            case key.startsWith('--click') && !key.match(/(\-){2}(click\:)([^\s]*)+/):
                throw SyntaxClickError;
            case key.startsWith('--click'):
                const [input, t, click, caseName] = key.match(/(\-){2}(click\:)([^\s]*)+/);
                result += `
                    ${node.id}.directives.push({
                        type: 'click',
                        case: '${click}${caseName}',
                    });
                `;
        }
    }
    // directives that starts with --
    node.hasDirective = true;
  }

  return result;
}