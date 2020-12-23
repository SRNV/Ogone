import Ogone from "./classes/Ogone.ts";
import ComponentTopLevelAnalyzer from "./classes/ComponentTopLevelAnalyzer.ts";
import Constructor from "./classes/Constructor.ts";
import ComponentTypeGetter from "./classes/ComponentTypeGetter.ts";
import ComponentCompiler from "./classes/ComponentCompiler.ts";
import ProtocolBodyConstructor from "./classes/ProtocolBodyConstructor.ts";
import ProtocolClassConstructor from "./classes/ProtocolClassConstructor.ts";
import ProtocolDataProvider from "./classes/ProtocolDataProvider.ts";
import ProtocolModifierGetter from "./classes/ProtocolModifierGetter.ts";
import ProtocolReactivity from "./classes/ProtocolReactivity.ts";
import type { OgoneConfiguration } from "./.d.ts";
import { Configuration } from "./classes/Configuration.ts";
import XMLParser from './classes/XMLParser.ts';
import AssetsParser from './classes/AssetsParser.ts';
import ComponentBuilder from './classes/ComponentBuilder.ts';
import { MapPosition } from './classes/MapPosition.ts';
import StylesheetBuilder from './classes/StylesheetBuilder.ts';
import { Utils } from './classes/Utils.ts';

export {
  Ogone,
  XMLParser,
  AssetsParser,
  ComponentBuilder,
  MapPosition,
  Utils,
  Constructor,
  ComponentTypeGetter,
  ComponentCompiler,
  ComponentTopLevelAnalyzer,
  StylesheetBuilder,
  ProtocolBodyConstructor,
  ProtocolClassConstructor,
  ProtocolDataProvider,
  ProtocolModifierGetter,
  ProtocolReactivity,
};
export default {
  async run(opts: OgoneConfiguration): Promise<void> {
    Configuration.setConfig(opts);
    await new Ogone(opts);
  },
};
