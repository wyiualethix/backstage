import { createContext, useContext } from 'react';

function getGlobalObject() {
  if (typeof window !== "undefined" && window.Math === Math) {
    return window;
  }
  if (typeof self !== "undefined" && self.Math === Math) {
    return self;
  }
  return Function("return this")();
}
const globalObject = getGlobalObject();
const makeKey = (id) => `__@backstage/${id}__`;
function getOrCreateGlobalSingleton(id, supplier) {
  const key = makeKey(id);
  let value = globalObject[key];
  if (value) {
    return value;
  }
  value = supplier();
  globalObject[key] = value;
  return value;
}

function createVersionedValueMap(versions) {
  Object.freeze(versions);
  return {
    atVersion(version) {
      return versions[version];
    }
  };
}

function createVersionedContext(key) {
  return getOrCreateGlobalSingleton(key, () => createContext(void 0));
}
function useVersionedContext(key) {
  return useContext(createVersionedContext(key));
}
function createVersionedContextForTesting(key) {
  return {
    set(versions) {
      globalThis[`__@backstage/${key}__`] = createContext(createVersionedValueMap(versions));
    },
    reset() {
      delete globalThis[`__@backstage/${key}__`];
    }
  };
}

export { createVersionedContext, createVersionedContextForTesting, createVersionedValueMap, getOrCreateGlobalSingleton, useVersionedContext };
//# sourceMappingURL=index.esm.js.map
