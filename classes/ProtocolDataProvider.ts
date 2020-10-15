import type { Bundle, Component } from '../.d.ts';
import ProtocolLabelGetter from './ProtocolLabelGetter.ts';
import { LabelContext } from './ProtocolLabelGetter.ts';
import { Utils } from './Utils.ts';
/**
 * @name ProtocolDataProvider
 * @code OPDP2-OSB7-OC0
 * @description
 * better class to provide all part of the protocol
 */
export default class ProtocolDataProvider extends Utils {
  private ProtocolLabelGetter: ProtocolLabelGetter = new ProtocolLabelGetter();
  public async read(bundle: Bundle) {
    const entries = Array.from(bundle.components.entries());
    entries.forEach(([, component]: [string, Component]) => {
      const proto = component.elements.proto[0];
      if (!proto || !proto.getInnerHTML) return;
      const protocol = proto.getInnerHTML();
      this.ProtocolLabelGetter.registerLabelProviders(protocol, {
        labels: [
          {
            token: 'def',
            unique: true,
            indentStyle: true,
            onParse: (ctx: LabelContext) => {
              console.warn("def", ctx)
            }
          },
          {
            token: 'declare',
            unique: true,
            indentStyle: true,
            isReactive: true,
            onParse: (ctx: LabelContext) => {
              console.warn("declare", ctx)
              console.warn(ctx.value)
            }
          },
          {
            token: 'default',
            unique: true,
            isReactive: true,
            onParse: (ctx: LabelContext) => {
              console.warn("default", ctx)
              console.warn(ctx.value);
            }
          },
          {
            token: 'before-each',
            unique: true,
            onParse: (ctx: LabelContext) => {
              console.warn("before-each", ctx)
            }
          },
          {
            token: 'mental',
            unique: true,
            onParse: (ctx: LabelContext) => {
              console.warn("mental", ctx)
            }
          },
          {
            token: 'case',
            argumentType: 'string',
            unique: false,
            isReactive: true,
            onParse: (ctx: LabelContext) => {
              console.warn("case", ctx)
            }
          },
        ],
        onError: (err) => {
          this.error(err.message);
        }
      });
    })
  }
}
