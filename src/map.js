const debug = require('debug')('ya-ssr:mapping');

function mapEntity(Target) {
  // Target 为 构建器本身
  debug('mapEntity.target', Target.name);
  let maps = Target.__MAPS__;
  let antiMaps = Target.__AntiMAPS__;

  let WrappedTarget = class extends Target {
    constructor() {
      super(...arguments);
      let origin = arguments[0] || {};
      for (let [name, aliasFrom] of Object.entries(maps)) {
        this[name] = origin[aliasFrom];
      }
    }
    toJSON() {
      let obj = {};
      for (let [aliasFrom, name] of Object.entries(antiMaps)) {
        obj[aliasFrom] = this[name];
      }
      return obj;
    }
  }
  return WrappedTarget;
}

function mapProperty(key) {
  debug(key);
  return function decorator(Target, name, descriptor) {
    debug('mapProperty', Target.constructor.name, name);
    // TODO 为什么要记在contructor上？与target区别?
    let constructor = Target.constructor;
    let maps = constructor.__MAPS__ = constructor.__MAPS__ || {};
    let antiMaps = constructor.__AntiMAPS__ = constructor.__AntiMAPS__ || {};
    maps[name] = key;
    antiMaps[key] = name;
    // TODO 必须设置writable, 不然报错，提示不可写
    descriptor.writable = true;
    return descriptor;
  }
}


@mapEntity
class Agent {
  @mapProperty('ID')
  id;
  @mapProperty('real_name')
  name;
}

export default Agent;

export { mapEntity, mapProperty };


function test() {
  let agent = new Agent({
    ID: 1,
    'real_name': 'tom'
  });
  console.log(agent.id);
  console.log(agent.name);
  console.log(agent.toJSON());

  agent.id = 11;
  agent.name = 'newname';
  console.log(agent.toJSON());


  let agent2 = new Agent();
  agent2.id = 2;
  agent2.name = 'jim';
  console.warn(agent2.toJSON());

}
