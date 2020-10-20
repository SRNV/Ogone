import { Utils } from './Utils.ts';
import { Component } from '../.d.ts';
import { ModifierContext } from './ProtocolModifierGetter.ts';
import read from '../utils/agnostic-transformer.ts';
import notParsedElements from '../utils/not-parsed.ts';
import elements from '../utils/elements.ts';
import reflectionsElements from '../utils/assets/reflection-syntax-elements.ts';
import getTypedExpressions from '../utils/typedExpressions.ts';

export default class ProtocolBodyConstructor extends Utils {
  public setBeforeEachContext(component: Component, ctx: ModifierContext) {
    if (ctx.token === 'before-each') {
      component.modifiers.beforeEach = ctx.value;
    }
  }
  public setComputeContext(component: Component, ctx: ModifierContext) {
    if (ctx.token === 'compute') {
      const expressions = {};
      const typedExpressions = getTypedExpressions();
      read({
        array: notParsedElements.concat(elements).concat(reflectionsElements),
        value: ctx.value,
        typedExpressions,
        expressions
      });
      component.modifiers.compute = typedExpressions.reflections.join('\n');
    }
  }
}