import Ogone from "./src/classes/main/Ogone.ts";
import EnvServer from './src/classes/EnvServer.ts';
import ComponentTopLevelAnalyzer from "./src/classes/ComponentTopLevelAnalyzer.ts";
import Constructor from "./src/classes/Constructor.ts";
import ComponentTypeGetter from "./src/classes/ComponentTypeGetter.ts";
import ComponentCompiler from "./src/classes/ComponentCompiler.ts";
import ProtocolBodyConstructor from "./src/classes/ProtocolBodyConstructor.ts";
import ProtocolClassConstructor from "./src/classes/ProtocolClassConstructor.ts";
import ProtocolDataProvider from "./src/classes/ProtocolDataProvider.ts";
import ProtocolModifierGetter from "./src/classes/ProtocolModifierGetter.ts";
import ProtocolReactivity from "./src/classes/ProtocolReactivity.ts";
import type { OgoneConfiguration } from "./src/ogone.main.d.ts";
import { Configuration } from "./src/classes/Configuration.ts";
import XMLParser from './src/classes/XMLParser.ts';
import AssetsParser from './src/classes/AssetsParser.ts';
import ComponentBuilder from './src/classes/ComponentBuilder.ts';
import DefinitionProvider from './src/classes/DefinitionProvider.ts';
import { MapPosition } from './src/classes/MapPosition.ts';
import StylesheetBuilder from './src/classes/StylesheetBuilder.ts';
import { Utils } from './src/classes/Utils.ts';

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
  DefinitionProvider
};
export default {
  async run(opts: OgoneConfiguration): Promise<void> {
    Configuration.setConfig(opts);
    const env = new EnvServer();
    await env.run(opts);
  },
};
