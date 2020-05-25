import domparse from "../src/lib/dom-parser/index.js";
import { assertEquals, assertThrows, assertStrContains, assertArrayContains, fail } from "https://raw.githubusercontent.com/denoland/deno/master/std/testing/asserts.ts";

Deno.test('- domparser first node is a template', () => {
  const root = domparse('');
  const docCreateNull = 'document.createElement(\'null\')';
  assertArrayContains(Object.keys(root), [
    'tagName',
    'rawAttrs',
    'childNodes',
    'attributes',
    'id',
    'pragma'
  ]);
  assertEquals(root.tagName, null);
  assertEquals(root.rawAttrs, '');
  assertEquals(root.nodeType, 1);
  assertEquals(root.childNodes, []);
  assertEquals(root.id, 'nt');
  assertEquals(root.pragma instanceof Function, true);
  assertStrContains(root.pragma(), docCreateNull);
});
Deno.test('- domparser can parse div and attrs', () => {
  const root = domparse(`<div
    :
    @custom-Attr
    --await
    l
    d
    0234
    $="test\\"">
  </div>`);
  if (!root.childNodes || !root.childNodes[0]) fail();
  assertEquals(root.childNodes[0].tagName, 'div');
  assertArrayContains(Object.keys(root.childNodes[0]), [
    'tagName',
    'rawAttrs',
    'childNodes',
    'attributes',
    'id',
    'pragma'
  ]);
  assertArrayContains(Object.keys(root.childNodes[0].attributes), [
    '@custom-Attr',
    '--await',
    ':',
    'l',
    'd',
    '0234',
    '$',
  ]);
  assertEquals(root.childNodes[0].attributes['$'], 'test\\\"')
});
Deno.test('- domparser can parse autoclosing elements', () => {
  const root = domparse(`<img />`);
  if (!root.childNodes || !root.childNodes[0]) fail();
  assertEquals(root.childNodes[0].tagName, 'img');
});
Deno.test('- domparser can parse nextElementSibling/ previousElementSibling', () => {
  const root = domparse(`<div></div><img/><span></span>`);
  if (!root.childNodes || !root.childNodes[0]) fail('no element parsed');
  const [div, img, span] = root.childNodes;
  assertEquals(div.tagName, 'div');
  assertEquals(img.tagName, 'img');
  assertEquals(span.tagName, 'span');
  assertEquals(span.previousElementSibling, img);
  assertEquals(img.nextElementSibling, span);
  assertEquals(img.previousElementSibling, div);
  assertEquals(div.nextElementSibling, img);
});

Deno.test('- domparser can parse Textnodes', () => {
  const root = domparse(`a<span>< text ></span>node`);
  if (!root.childNodes || root.childNodes.length !== 3) fail('One element is missing or there is one extra');
  const [a, span, node] = root.childNodes;
  const [text] = span.childNodes;
  assertEquals(a.rawText, 'a');
  assertEquals(span.rawText, undefined);
  assertEquals(node.rawText, 'node');
  assertEquals(span.nodeType, 1);
  assertEquals(text.nodeType, 3);
  assertEquals(text.rawText, "< text >");
});

Deno.test('- domparser ignore comments', () => {
  const root = domparse(`<!-- comment -->`);
  if (!root.childNodes || root.childNodes.length > 0) fail('domparser should have ignored the comment. v0.3.0');
});

Deno.test('- domparser can parse deep elements', () => {
  const root = domparse(`<div><div><div><div><div><div><div></div></div></div></div></div></div></div>`);
  if (!root.childNodes) fail('no element parsed');
  let level = 0;
  function depthTest(node: any) {
    if (node.childNodes) {
      node.childNodes.forEach((child: any) => {
        depthTest(child)
      })
      level++;
    }
  }
  depthTest(root);
  assertEquals(level, 8)
});
