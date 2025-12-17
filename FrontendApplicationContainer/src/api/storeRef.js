let _store = null;

// PUBLIC_INTERFACE
export function setStore(store) {
  _store = store;
}

// PUBLIC_INTERFACE
export const store = {
  getState: () => (_store ? _store.getState() : {}),
};
