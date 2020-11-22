import DOMElement from '../src/classes/DOMElement.ts';
import OgoneComponent from '../src/classes/OgoneComponent.ts';
import { assertEquals, v4 } from '../deps.ts';

const fragment = new DOMElement({
  children: [],
  name: undefined,
  nodeType: 11,
});

const component = new OgoneComponent({
  file: `${Deno.cwd()}/tests.tsx`,
  uuid: v4.generate(),
  name: 'test-component',
  templateFactory: () => fragment,
});
fragment.component = component;

const fragmentTemplate = new DOMElement({
  children: [],
  name: 'template',
  nodeType: 1,
  parent: fragment
});
fragment.children.push(fragmentTemplate);
const template = new DOMElement({
  children: [],
  name: 'template',
  nodeType: 1,
  value: '',
});
const textnode = new DOMElement({
  children: [],
  name: undefined,
  nodeType: 3,
  parent: template,
  value: 'Hello',
});
const boundTextnode = new DOMElement({
  children: [],
  name: undefined,
  nodeType: 3,
  parent: template,
  value: () => 'sdgf',
});
const node = new DOMElement({
  children: [],
  name: 'div',
  nodeType: 1,
  parent: template,
  value: '',
});

Deno.test('basic: nodeType 1 is an element', () => {
  const domelement = new DOMElement({
    nodeType: 1,
    children: [],
    name: 'div'
  });
  assertEquals('div', domelement.name);
  assertEquals(false, domelement.isComponent);
  assertEquals(false, domelement.isTemplate);
  assertEquals(false, domelement.isStyle);
  assertEquals(false, domelement.isBoundTextnode);
  assertEquals(false, domelement.isFragment);
  assertEquals(1, domelement.nodeType);
  assertEquals(undefined, domelement.parentComponent);
  const child = new DOMElement({
    nodeType: 1,
    children: [],
    name: 'div'
  });
  domelement.setChild(child);
  assertEquals(true, domelement.children.includes(child));
  assertEquals(true, domelement.uuid.startsWith('n'));
});

Deno.test('first letter of DOMElement\'s uuid sould depend on it\'s nodeType', () => {
  assertEquals(true, template.uuid.startsWith('tmp'));
  assertEquals(true, node.uuid.startsWith('n'));
  assertEquals(true, template.uuid.startsWith('t'));
});

Deno.test('type validators of DOMElement are correct', () => {
  assertEquals(false, fragment.isTemplate);
  assertEquals(false, fragment.isStyle);
  assertEquals(true, fragment.isFragment);
  assertEquals(false, fragment.isComponent);
  assertEquals(false, fragment.isBoundTextnode);

  assertEquals(true, template.isTemplate);
  assertEquals(false, template.isStyle);
  assertEquals(false, template.isFragment);
  assertEquals(false, template.isComponent);
  assertEquals(false, template.isBoundTextnode);

  assertEquals(true, fragmentTemplate.isTemplate);
  assertEquals(false, fragmentTemplate.isStyle);
  assertEquals(false, fragmentTemplate.isFragment);
  assertEquals(false, fragmentTemplate.isComponent);
  assertEquals(false, fragmentTemplate.isBoundTextnode);

  assertEquals(false, textnode.isTemplate);
  assertEquals(false, textnode.isStyle);
  assertEquals(false, textnode.isFragment);
  assertEquals(false, textnode.isComponent);
  assertEquals(false, textnode.isBoundTextnode);

  assertEquals(false, boundTextnode.isTemplate);
  assertEquals(false, boundTextnode.isStyle);
  assertEquals(false, boundTextnode.isFragment);
  assertEquals(false, boundTextnode.isComponent);
  assertEquals(true, boundTextnode.isBoundTextnode);

  assertEquals(false, node.isTemplate);
  assertEquals(false, node.isStyle);
  assertEquals(false, node.isFragment);
  assertEquals(false, node.isComponent);
  assertEquals(false, node.isBoundTextnode);
});

Deno.test('elements can access to the component', () => {
  assertEquals(true, fragment.component === component);
  assertEquals(true, fragmentTemplate.parentComponent === component);
  assertEquals('test-component', fragmentTemplate.parentComponent && fragmentTemplate.parentComponent.name);
});