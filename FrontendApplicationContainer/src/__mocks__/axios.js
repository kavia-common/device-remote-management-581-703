'use strict';

/**
 * Manual Jest mock for axios (CommonJS).
 * Provides axios-like API including create() and interceptors for tests
 * without depending on ESM bundle resolution.
 */

const makeAxiosInstance = (base = {}) => {
  // Minimal interceptors implementation
  const createInterceptorManager = () => {
    const handlers = [];
    return {
      use: (fulfilled, rejected) => {
        handlers.push({ fulfilled, rejected });
        return handlers.length - 1;
      },
      eject: (id) => {
        if (handlers[id]) handlers[id] = null;
      },
      handlers,
    };
  };

  const instance = function axios(configOrUrl, maybeConfig) {
    const config = typeof configOrUrl === 'string'
      ? { url: configOrUrl, ...(maybeConfig || {}) }
      : (configOrUrl || {});

    // Apply request interceptors
    let req = { ...config };
    instance.interceptors.request.handlers.forEach(h => {
      if (h && typeof h.fulfilled === 'function') {
        req = h.fulfilled(req) || req;
      }
    });

    // Default mock response; tests can spyOn and override implementations
    const response = {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: req,
    };

    // Apply response interceptors
    let res = response;
    instance.interceptors.response.handlers.forEach(h => {
      if (h && typeof h.fulfilled === 'function') {
        res = h.fulfilled(res) || res;
      }
    });

    return Promise.resolve(res);
  };

  instance.defaults = { headers: {}, baseURL: '', timeout: 0, ...base.defaults };
  instance.interceptors = {
    request: createInterceptorManager(),
    response: createInterceptorManager(),
  };

  // HTTP verb helpers
  ['get', 'delete', 'head', 'options'].forEach(method => {
    instance[method] = (url, config = {}) => instance({ method, url, ...config });
  });
  ['post', 'put', 'patch'].forEach(method => {
    instance[method] = (url, data, config = {}) => instance({ method, url, data, ...config });
  });

  instance.create = (cfg = {}) => {
    const created = makeAxiosInstance({ defaults: { ...(instance.defaults || {}), ...(cfg || {}) } });
    return created;
  };

  instance.isAxiosError = (err) => !!(err && err.isAxiosError);

  return instance;
};

const axios = makeAxiosInstance();

module.exports = axios;
