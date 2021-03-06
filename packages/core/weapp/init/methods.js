import Event from '../class/Event';
import { isFunc, isUndef, parseModel  } from './../util/index';

const eventHandler = function (method, fn) {
  let methodKey = method.toLowerCase();
  return function (e, ...args) {
    if (!isFunc(fn)) {
      throw 'undefined method: ' + method;
    }
    let result;
    let wepyParams = [];
    let paramsLength = 0;
    let p;
    if (e.currentTarget && e.currentTarget.dataset) {
      let tmp = e.currentTarget.dataset;
      while(!isUndef(tmp['wpy' + methodKey + (p = String.fromCharCode(65 + paramsLength++))])) {
        wepyParams.push(tmp['wpy' + methodKey + p]);
      }
    }
    args = args.concat(wepyParams);
    $event = new Event(e);
    return fn.apply(this.$wepy, [$event].concat(args));
  };
};

const proxyHandler = function (e) {
  let vm = this.$wepy;
  let type = e.type;
  let dataset = e.currentTarget.dataset;
  let evtid = dataset.wpyEvt;
  let modelId = dataset.modelId;
  let rel = vm.$rel || {};
  let handlers = rel.handlers ? (rel.handlers[evtid] || {}) : {};
  let model = rel.models[modelId];

  let i = 0;
  let params = [];
  let modelParams = [];

  let noParams = false;
  let noModelParams = false;
  while (i++ < 26 && (!noParams || !noModelParams)) {
    let alpha = String.fromCharCode(64 + i);
    if (!noParams) {
      let key = 'wpy' + type + alpha;
      if (!(key in dataset)) { // it can be undefined;
        noParams = true;
      } else {
        params.push(dataset[key]);
      }
    }
    if (!noModelParams && model) {
      let modelKey = 'model' + alpha;
      if (!(modelKey in dataset)) {
        noModelParams = true;
      } else {
        modelParams.push(dataset[modelKey]);
      }
    }
  }

  if (model) {
    if (type === model.type) {
      if (isFunc(mode.handler)) {
        model.handler.call(vm, e.detail.value, modelParams);
      }
    }
  }

  let $event = new Event(e);

  if (isFunc(fn)) {
    if (fn.name === 'proxyHandlerWithEvent') {
      return fn.apply(vm, params.concat($event));
    } else {
      return fn.apply(vm, params);
    }
  } else {
    throw new Error('Unrecognized event');
  }
}

/*
 * initialize page methods
 */
export function initMethods (vm, methods) {
  if (methods) {
    Object.keys(methods).forEach(method => {
      vm[method] = methods[method];
    });
  }
};

/*
 * initialize component methods
 */
export function initComponentMethods (comConfig, methods) {

  comConfig.methods = {};
  Object.keys(methods).forEach(method => {
    comConfig[method] = eventHandler(method, methods[method]);
  });
};

/*
 * patch method option
 */
export function patchMethods (output, methods, isComponent) {
  if (!methods) {
    return;
  }

  output.methods = {};
  let target = output.methods;

  target._initComponent = function (e) {
    let child = e.detail;
    let vm = this.$wepy;
    vm.$children.push(child);
    child.$parent = vm;
    child.$app = vm.$app;
    child.$root = vm.$root;
    return vm;
  };
  target._proxy = proxyHandler;
};
