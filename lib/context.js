'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = configureContext;

var _chai = require('chai');

var _validate = require('./validate');

var _log = require('./log');

var _actionBlueprint = require('./actionBlueprint');

/**
 * @typedef {Object} LibOpts
 * @property {string} libName the name of the library.
 * @property {function(context: LibContext): AppValidator} createValidator
 */

/**
 * @typedef {function(opts: AppOpts)} AppValidator
 */

/**
 * @typedef {Object} AppOpts
 * @property {string} appName the name of the application.
 */

/**
 * @typedef {Object} LibContext
 * @property {string} libName the name of the library.
 * @property {string} appName the name of the application.
 * @property {string} actionNames the names of the defined actions (ordered).
 */

/**
 * @typedef {LibAction[]} LibActions
 */

/**
 * @typedef {Array} LibAction
 */

/**
 * @typedef {Object} LibContext
 * @property {string[]} actionNames the names of all the actions (ordered).
 */

/**
 * @typedef CreateContext
 * @type {function(appOpts: AppOpts): AppContext }
 */

var noop = function noop() {};
var cleanActionName = function cleanActionName(name) {
  return name.toUpperCase().replace(/-+\s+/, '_');
};

/** Validates library creators options */
var validateLibOpts = function validateLibOpts(libOptsRaw) {
  _chai.assert.ok(libOptsRaw, 'libOpts definition is required');
  var libName = libOptsRaw.libName;
  var validateContext = libOptsRaw.validateContext;
  var configureAppContext = libOptsRaw.configureAppContext;
  var configureInitialState = libOptsRaw.configureInitialState;

  (0, _chai.assert)(typeof libName === 'string', 'libName must be a string');
  (0, _chai.assert)(libName.length > 0, 'libName must not be empty');

  _chai.assert.ok(validateContext, 'validateContext must exist');
  (0, _chai.assert)(typeof validateContext === 'function', 'validateContext must be a function');

  _chai.assert.ok(configureAppContext, 'configureAppContext must exist');
  (0, _chai.assert)(typeof configureAppContext === 'function', 'configureAppContext must be a function');

  _chai.assert.ok(configureInitialState, 'configureInitialState must exist');
  (0, _chai.assert)(typeof configureInitialState === 'function', 'configureInitialState must be a function');
};

/** Validates library consumers options */
var validateAppOpts = function validateAppOpts(appOptsRaw) {
  _chai.assert.ok(appOptsRaw, 'appOpts are required');
  var appName = appOptsRaw.appName;


  (0, _chai.assert)(typeof appName === 'string', 'appName opt must be a string');
  (0, _chai.assert)(appName.length > 0, 'appName opt must not be empty');
};
var isDev = process.env.NODE_ENV !== 'production';

/*
import configureContext from 'redux-addons/context'
const context = configureContext(libOpts)(appOpts)
const {  } = context
 */
function configureContext(libOpts) {
  if (isDev) validateLibOpts(libOpts);
  var libName = libOpts.libName;
  var validateContext = libOpts.validateContext;
  var configureAppContext = libOpts.configureAppContext;
  var configureInitialState = libOpts.configureInitialState;

  return function (appOpts) {
    if (isDev) validateAppOpts(appOpts);
    var appName = appOpts.appName;
    var level = appOpts.level;


    var createActionType = function createActionType(actionName) {
      return cleanActionName(libName) + '_' + cleanActionName(appName) + '_' + cleanActionName(actionName);
    };
    var translateBlueprints = (0, _actionBlueprint.createBlueprintsTranslator)(createActionType);

    var libContext = { log: (0, _log.createLogger)({ libName: libName, level: level }),
      libName: libName,
      appName: appName,
      createActionType: createActionType,
      translateBlueprints: translateBlueprints
    };

    var appContext = configureAppContext(libContext)(appOpts);
    if (isDev) validateContext(libContext, appContext);

    return Object.assign(appContext, libContext, { get initialState() {
        return configureInitialState(libContext)(appContext);
      }
    });
  };
}