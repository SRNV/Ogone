import Ogone from '../../index.ts';
import iterator from '../../../../lib/iterator.js';

export default function getAppendChilds(component, node, elementid, query, appender) {
    return node.childNodes.length ? node.childNodes.map((child, childIndex) => {
        const childId = `${component.uuid}-${child.nuuid}`;
        const childCtxId = `${component.uuid}-[${child.nuuid}]`;
        const childTextNodePositionSTR = `(parentId || \'\')+' [${node.nuuid}-'+index+'] ${childIndex}'`;
        let templateDeclaration = '';
        if (child.nodeType === 1) {
          const isNodeComponent = !!component.imports[child.tagName];
          let childProps = '';
          const childHasProps = child.props && child.props.length > 0;
          if (childHasProps) {
            childProps = JSON.stringify(child.props);
          }
          templateDeclaration = `
            subnode = Ogone.templates['${childId}'](component, {
              nodeManager: null,
              hasNodeManager: true,
              parentNodeManager: nm ? nm : null,
              level: level + 1,
              position: newPosition,
              dependencies: ${JSON.stringify(child.dependencies)},
              props: ${childHasProps ? childProps : null},
              ${
                isNodeComponent ?
                `
                  parentComponent: component,
                  parentContextId: '${childCtxId}',
                `: ''
              }
              ${
                node.nuuid ?
                  `parentId: ((parentId || \'\')+ ' ['+'${node.nuuid}-'+index+']').trim(),`:
                  `parentId: null,`
              }
            })
            ${appender}.append(subnode);`.trim();
        }
        if (child.nodeType === 3 && child.rawText.trim().length && node.tagName !== null) {
          templateDeclaration = `
            ${ child.rawText.indexOf('${') > -1 ? `
              text = new Text(nm.getContext({
                position: newPosition,
                getText: '\`${child.rawText.trim()}\`',
              }));
              text.rawText = '${child.rawText.trim()}';
              text.uuid = ((parentId || \'\')+ ' ['+'${node.nuuid}-'+index+']').trim();
              nm.texts[${childTextNodePositionSTR}] = text;
              ${appender}.append(text);
              ` : `${appender}.append(new Text('${child.rawText.trim()}'));`
            }`; // end templateDeclaration
          }
          return templateDeclaration;
        }).join('\n') : '';
}