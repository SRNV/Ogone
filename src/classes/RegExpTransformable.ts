import { Utils } from "./Utils.ts";
import type {
  ProtocolScriptRegExpItem,
} from "../ogone.main.d.ts";

export default class RegExpTransformable extends Utils implements ProtocolScriptRegExpItem {
  public name?: string;
  public close?: ProtocolScriptRegExpItem['close'] = false;
  public open?: ProtocolScriptRegExpItem['open'] = false;
  constructor(public reg: ProtocolScriptRegExpItem['reg'], public id: ProtocolScriptRegExpItem['id']) {
    super();
  }
  setName(name: string): RegExpTransformable {
    this.name = name;
    return this;
  }
}