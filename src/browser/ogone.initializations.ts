import Ogone from '../classes/Ogone.ts';

Ogone.stores = {};
Ogone.clients = [];
Ogone.render = {};
Ogone.contexts = {};
Ogone.components = {};
Ogone.classes = {};
Ogone.errorPanel = null;
Ogone.warnPanel = null;
Ogone.successPanel = null;
Ogone.infosPanel = null;
Ogone.errors = 0;
Ogone.firstErrorPerf = null;
Ogone.mod = {
  "*": [], // for reactions
};
Ogone.instances = {};