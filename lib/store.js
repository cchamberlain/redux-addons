'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStoreMultiplexer = exports.createActionMultiplexer = exports.selectState = exports.bisectStore = exports.createMergingReducer = exports.configureReducer = exports.createJSONLocalStore = exports.createLocalStore = exports.createJSONSessionStore = exports.createSessionStore = exports.configureLocalStore = exports.configureSessionStore = exports.configureBrowserStore = exports.configureBrowserStateAccessor = exports.configureLocalStateAccessor = exports.configureSessionStateAccessor = exports.createNoopStore = exports.toConstCase = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _chai = require('chai');

var _reduxActions = require('redux-actions');

var noop = function noop() {};

/** Formats a string as CONST_CASE */
var toConstCase = exports.toConstCase = function toConstCase(value) {
  return value.replace(/[- ]/, '_').toUpperCase();
};

/**
 * Creates a store with all functions returning noop
 * @return {Object}     Noop store object with noop dispatch, getState, subscribe, and replaceReducer functions.
 */
var createNoopStore = exports.createNoopStore = function createNoopStore() {
  return { dispatch: noop, subscribe: noop, getState: noop, replaceReducer: noop };
};

var configureSessionStateAccessor = exports.configureSessionStateAccessor = function configureSessionStateAccessor(opts) {
  return configureBrowserStateAccessor(sessionStorage, opts);
};
var configureLocalStateAccessor = exports.configureLocalStateAccessor = function configureLocalStateAccessor(opts) {
  return configureBrowserStateAccessor(localStorage, opts);
};

/**
 * Configures an accessor object with getState and setState functions for interacting with browser storage.
 * @param  {Object}   browserStorage    The storage medium to use (sessionStorage / localStorage).
 * @param  {String}   options.prefix    The prefix to use for state keys.
 * @param  {Boolean}  options.useJSON   Enables serializing to a single JSON string and uses a single storage key.
 * @param  {Function} options.formatKey The formatter to use for storage keys.
 * @return {Function}                   Thunk taking initialState and returning initialized getState and setState functions.
 */
var configureBrowserStateAccessor = exports.configureBrowserStateAccessor = function configureBrowserStateAccessor(browserStorage) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$prefix = _ref.prefix;
  var prefix = _ref$prefix === undefined ? 'REDUX_BROWSER' : _ref$prefix;
  var _ref$useJSON = _ref.useJSON;
  var useJSON = _ref$useJSON === undefined ? false : _ref$useJSON;
  var _ref$formatKey = _ref.formatKey;
  var formatKey = _ref$formatKey === undefined ? function (prefix) {
    var key = arguments.length <= 1 || arguments[1] === undefined ? 'STATE' : arguments[1];
    return toConstCase(prefix) + '_' + toConstCase(key);
  } : _ref$formatKey;

  _chai.assert.ok(browserStorage, 'browserStorage is required (localStorage or sessionStorage)');
  (0, _chai.assert)((typeof browserStorage === 'undefined' ? 'undefined' : _typeof(browserStorage)) === 'object', 'browserStorage must be an object');
  (0, _chai.assert)(typeof browserStorage.setItem === 'function', 'browserStorage have same setter interface as localStorage / sessionStorage');
  (0, _chai.assert)(typeof browserStorage.getItem === 'function', 'browserStorage have same getter interface as localStorage / sessionStorage');

  var stateName = formatKey(prefix);

  /** Will create the stateAccessor and initialize it with initialState */
  return function (initialState) {
    _chai.assert.ok(initialState, 'initialState is required.');
    (0, _chai.assert)((typeof initialState === 'undefined' ? 'undefined' : _typeof(initialState)) === 'object', 'initialState must be an object.');
    var keyMap = useJSON ? noop() : new Map(Object.keys(initialState).map(function (x) {
      return [x, formatKey(prefix, x)];
    }));
    var setState = useJSON ? function (newState) {
      /** Serialize to a single JSON string and serialize that. */
      browserStorage.setItem(stateName, JSON.stringify(newState));
    } : function (newState) {
      /** Set individual storage keys. */
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = keyMap.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2);

          var key = _step$value[0];
          var storageKey = _step$value[1];

          browserStorage.setItem(storageKey, newState[key]);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    };

    var getState = useJSON ? function () {
      var serializedState = browserStorage.getItem(stateName);
      if (serializedState) return JSON.parse(serializedState);
    } : function () {
      var newState = {};
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = keyMap.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _step2$value = _slicedToArray(_step2.value, 2);

          var key = _step2$value[0];
          var storageKey = _step2$value[1];

          newState[key] = browserStorage.getItem(storageKey);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return newState;
    };
    setState(initialState);
    return { setState: setState, getState: getState };
  };
};

/** Asserts that createBrowserStore options are valid. */
var assertBrowserStore = function assertBrowserStore(reducer, initialState, createBrowserStateAccessor) {
  _chai.assert.ok(reducer, 'reducer is required');
  (0, _chai.assert)(typeof reducer === 'function', 'reducer must be a function');
  _chai.assert.ok(initialState, 'initialState is required');
  (0, _chai.assert)((typeof initialState === 'undefined' ? 'undefined' : _typeof(initialState)) === 'object', 'initialState must be an object');
  _chai.assert.ok(createBrowserStateAccessor, 'createBrowserStateAccessor is required');
  (0, _chai.assert)(typeof createBrowserStateAccessor === 'function', 'createBrowserStateAccessor must be a function');
};

/**
 * Works the same as createStore but uses browserStorage as persistence medium.
 * @param  {!function}  localReducer - The reducer to create new state to be persisted.
 * @param  {!Object}    initialState - Initial state to create in local storage (REQUIRED).
 * @param  {String}     prefix - The local storage namespace to use.
 * @return {Object}     Local store object with dispatch, getState, subscribe, and replaceReducer functions.
 */
var configureBrowserStore = exports.configureBrowserStore = function configureBrowserStore(createBrowserStateAccessor) {
  return function (reducer, initialState) {
    if (process.env.NODE_ENV !== 'production') assertBrowserStore(reducer, initialState, createBrowserStateAccessor);

    var _createBrowserStateAc = createBrowserStateAccessor(initialState);

    var getState = _createBrowserStateAc.getState;
    var setState = _createBrowserStateAc.setState;

    var currentReducer = reducer;
    var listeners = [];
    var isDispatching = false;
    var subscribe = function subscribe(listener) {
      listeners.push(listener);
      return function () {
        var index = listeners.indexOf(listener);
        listeners.splice(index, 1);
      };
    };
    var dispatch = function dispatch(action) {
      if (isDispatching) throw new Error('Browser reducers may not dispatch actions.');
      try {
        isDispatching = true;
        setState(currentReducer(getState(), action));
      } finally {
        isDispatching = false;
      }
      listeners.slice().forEach(function (listener) {
        return listener();
      });
      return action;
    };
    var replaceReducer = function replaceReducer(nextReducer) {
      currentReducer = nextReducer;
      dispatch({ type: '@@redux-browser/INIT' });
    };
    dispatch({ type: '@@redux-browser/INIT' });
    return { dispatch: dispatch, subscribe: subscribe, getState: getState, replaceReducer: replaceReducer };
  };
};

/** Configures a createSessionStore thunk that returns the same interface as redux createStore */
var configureSessionStore = exports.configureSessionStore = function configureSessionStore(opts) {
  var createSessionStateAccessor = configureSessionStateAccessor(opts);
  return configureBrowserStore(createSessionStateAccessor);
};

/** Configures a createLocalStore thunk that returns the same interface as redux createStore */
var configureLocalStore = exports.configureLocalStore = function configureLocalStore(opts) {
  var createLocalStateAccessor = configureLocalStateAccessor(opts);
  return configureBrowserStore(createLocalStateAccessor);
};

/**
 * Creates sessionStorage interfacing component that implements redux store interface.
 * Uses one sessionStorage key per state node. Only supports primitive state keys.
 */
var createSessionStore = exports.createSessionStore = function createSessionStore(reducer, initialState) {
  return configureSessionStore({ useJSON: false })(reducer, initialState);
};

/**
 * Creates sessionStorage interfacing component that implements redux store interface.
 * Serializes / Deserializes state object to and from JSON. Supports nested structures.
 */
var createJSONSessionStore = exports.createJSONSessionStore = function createJSONSessionStore(reducer, initialState) {
  return configureSessionStore({ useJSON: true })(reducer, initialState);
};

/**
 * Creates localStorage interfacing component that implements redux store interface.
 * Uses one localStorage key per state node. Only supports primitive state keys.
 */
var createLocalStore = exports.createLocalStore = function createLocalStore(reducer, initialState) {
  return configureLocalStore({ useJSON: false })(reducer, initialState);
};

/**
 * Creates localStorage interfacing component that implements redux store interface.
 * Serializes / Deserializes state object to and from JSON. Supports nested structures.
 */
var createJSONLocalStore = exports.createJSONLocalStore = function createJSONLocalStore(reducer, initialState) {
  return configureLocalStore({ useJSON: true })(reducer, initialState);
};

/**
 * Configures a reducer that reduces action to a state, then optionally merges with previous state for subscribed action types.
 * @param  {function} actionReducer Map the action to the object that will be merged to state.
 * @param {bool}     mergeState    Defines whether the reducer results should be merged with the previous state.
 * @return {Object}                 New state object.
 */
var configureReducer = exports.configureReducer = function configureReducer(actionReducer) {
  var mergeState = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
  return function () {
    for (var _len = arguments.length, subscribeTypes = Array(_len), _key = 0; _key < _len; _key++) {
      subscribeTypes[_key] = arguments[_key];
    }

    return function (state, action) {
      return subscribeTypes.includes(action.type) ? mergeState ? Object.assign({}, state, actionReducer(action)) : actionReducer(action) : state;
    };
  };
};

/**
 * Creates a reducer that merged payload with state for matching subscribe types.
 * @param  {String[]} subscribeTypes   Action types to subscribe reducer to.
 */
var createMergingReducer = exports.createMergingReducer = configureReducer(function (action) {
  return action.payload;
}, true);

/**
 * Returns object implementing redux store interface whose getState method selects a sub tree of the overall state.
 * Useful for library components that embed state in a subnode of consumer apps redux state
 * @param  {Object}    store      A store to bisect
 * @param  {...String} selectKeys The selection path to use with getState
 * @return {Object}               A sub store implementing redux store interface
 */
var bisectStore = exports.bisectStore = function bisectStore(store) {
  for (var _len2 = arguments.length, selectKeys = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    selectKeys[_key2 - 1] = arguments[_key2];
  }

  _chai.assert.ok(store, 'store must exist');
  _chai.assert.ok(store.dispatch, 'store must define dispatch');
  _chai.assert.ok(store.getState, 'store must define getState');
  (0, _chai.assert)(selectKeys.length > 0, 'must define one or more keys to select on');

  return { dispatch: function dispatch(action) {
      return store.dispatch(action);
    },
    subscribe: function subscribe(listener) {
      return store.subscribe(listener);
    },
    getState: function getState() {
      return selectState(selectKeys, store.getState());
    }
  };
};

/** Selects a sub state from a state tree by path. */
var selectState = exports.selectState = function selectState(selectKeys, state, defaultValue) {
  (0, _chai.assert)(Array.isArray(selectKeys), 'selectKeys must be an array.');
  //assert(selectKeys.length > 0, 'must specify a selection path')
  _chai.assert.ok(state, 'state is required');
  var result = state;
  while (selectKeys.length > 0 && result) {
    result = state[selectKeys.shift()];
  }return result || defaultValue;
};

//actionDefinitionMapping === [actionName, actionDefinition]
// actionDefinition === { type, payloadCreactor, ?metaCreator }

//payloadCreator === (actionArgs => payload)
//metaCreator === (actionArgs => meta)
//const action = createAction(ACTION_TYPE, payloadCreator, metaCreator)(actionArgs)

var creatorOverride = function creatorOverride(props) {
  return function (creator) {
    return function (args) {
      return Object.assign({}, creator(args), props);
    };
  };
};

var delayOverride = function delayOverride(delay) {
  return overrideCreator({ delay: delay });
};

// TODO: MOVE THIS TO ACTIONS
var createActionMultiplexer = exports.createActionMultiplexer = function createActionMultiplexer(actionMapping) {
  _chai.assert.ok(actionMapping, 'actionMapping is required');
  (0, _chai.assert)(Array.isArray(actionMapping), 'actionMapping must be an array');
  (0, _chai.assert)(actionMapping.every(function (x) {
    return Array.isArray(x) && x.length === 2;
  }), 'actionMapping must be an array of [<name>, <store>] arrays');

  var actionMap = new Map(actionMapping);

  var translators = { delay: function delay(_delay) {
      return function (args) {
        return Object.assign({}, args, { delay: _delay });
      };
    }
  };

  var translateCreator = function translateCreator(creator) {
    return function (translate) {
      return function (args) {
        return translate(typeof creator === 'function' ? creator(args) : creator, args);
      };
    };
  };

  var identityTranslator = function identityTranslator(identity) {
    return identity;
  };

  var selectActionCreator = function selectActionCreator(actionName) {
    var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref2$translatePayloa = _ref2.translatePayload;
    var translatePayload = _ref2$translatePayloa === undefined ? identityTranslator : _ref2$translatePayloa;
    var _ref2$translateMeta = _ref2.translateMeta;
    var translateMeta = _ref2$translateMeta === undefined ? identityTranslator : _ref2$translateMeta;

    var actionDefinition = actionMap.get(actionName);
    _chai.assert.ok(actionDefinition, 'action definition for actionName ' + actionName + ' must be configured in createActionMultiplexer');
    var type = actionDefinition.type;
    var payloadCreator = actionDefinition.payloadCreator;
    var metaCreator = actionDefinition.metaCreator;

    _chai.assert.ok(type, 'action type must be defined for actionName => ' + actionName);
    (0, _chai.assert)(typeof type === 'string', 'action type must be string for actionName => ' + actionName);
    return (0, _reduxActions.createAction)(type, translateCreator(payloadCreator)(translatePayload), translateCreator(metaCreator)(translateMeta));
  };

  var selectDelayedActionCreator = function selectDelayedActionCreator(actionName, delay) {
    return selectActionCreator(actionName, { translateMeta: translators.delay(delay) });
  };

  var selectAction = function selectAction(actionName, args) {
    return selectActionCreator(actionName)(args);
  };

  return { selectActionCreator: selectActionCreator, selectDelayedActionCreator: selectDelayedActionCreator, selectAction: selectAction };
};

/**
 * createStoreMultiplexer([['lib', libStore], ['fast', fastStore], ['session', sessionStore], ['local', localStore]])
 * Takes in an ordered mapping of names to stores and reduces to a redux store compatible interface that can dispatch and getState to all stores or specific ones.
 * @param  {Array} storeMapping  The mapping of store names to store references.
 * @return {Object}              An object that can dispatch and getState to all stores or each individually.
 */
var createStoreMultiplexer = exports.createStoreMultiplexer = function createStoreMultiplexer(storeMapping, actionMultiplexer) {
  _chai.assert.ok(storeMapping, 'storeMapping is required');
  (0, _chai.assert)(Array.isArray(storeMapping), 'storeMapping must be an array');
  (0, _chai.assert)(storeMapping.every(function (x) {
    return Array.isArray(x) && x.length === 2;
  }), 'storeMapping must be an array of [<name>, <store>] arrays');

  var storeMap = new Map(storeMapping);
  var mapReduceStores = function mapReduceStores(operation) {
    var result = {};
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = storeMap.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _step3$value = _slicedToArray(_step3.value, 2);

        var name = _step3$value[0];
        var store = _step3$value[1];

        result[name] = operation(store);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return result;
  };

  var storesLiteral = storeMapping.reduce(function (prev, _ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    var name = _ref4[0];
    var store = _ref4[1];

    prev[name] = store;
    return prev;
  }, {});

  var createActionDispatcher = function createActionDispatcher(actionName) {
    return function () {
      var _ref5 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref5$delay = _ref5.delay;
      var delay = _ref5$delay === undefined ? 0 : _ref5$delay;

      return function (args) {
        if (delay <= 0) return dispatch(actionMultiplexer.selectActionCreator(actionName)(args));
        return dispatch(actionMultiplexer.selectDelayedActionCreator(actionName, delay)(args));
      };
    };
  };

  var dispatchAction = function dispatchAction(actionName, args) {
    var _ref6 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var _ref6$delay = _ref6.delay;
    var delay = _ref6$delay === undefined ? 0 : _ref6$delay;
    return createActionDispatcher(actionName)({ delay: delay })(args);
  };

  var dispatch = function dispatch(action) {
    return mapReduceStores(function (store) {
      return store.dispatch(action);
    });
  };
  var getState = function getState() {
    return mapReduceStores(function (store) {
      return store.getState();
    });
  };
  var selectFirst = function selectFirst() {
    for (var _len3 = arguments.length, names = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      names[_key3] = arguments[_key3];
    }

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = names[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var name = _step4.value;

        if (storeMap.has(name)) return storeMap.get(name);
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    throw new Error('None of the requested stores exist in storeMapping | configured => ' + JSON.stringify(storeMapping.map(function (x) {
      return x[0];
    })) + ' requested => ' + JSON.stringify(names));
  };
  var select = function select() {
    for (var _len4 = arguments.length, names = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      names[_key4] = arguments[_key4];
    }

    return names.filter(function (x) {
      return storeMap.has(x);
    }).map(function (x) {
      return storeMap.get(x);
    });
  };
  return _extends({}, storesLiteral, { dispatch: dispatch,
    getState: getState,
    selectFirst: selectFirst,
    select: select,
    createActionDispatcher: createActionDispatcher,
    dispatchAction: dispatchAction
  });
};