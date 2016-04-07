'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * Configures a Flux Standard Action creator injected with the libraries dispatcher and context.
 * @example <caption>Exports a Flux Standard Action creator that takes a handler injected with the libraries dispatcher and context.
 * export const createSomeUserAction = configureDispatcherAction((dispatcher, context) => dispatcher.action.execute('create-some-user-action'))
 * @param  {function} handler: (context, dispatcher) => { ... }
 */
//export const createActionDispatcher = context => handler => store => handler(dispatcher(dispatch, getState), context)

/** Allows the user of lib to define custom redux actions that an action creator retrieved from at a later time via a type map. */
var createActionBlueprint = exports.createActionBlueprint = function createActionBlueprint(actionName, payloadCreator, metaCreator) {
  return function (createActionType) {
    return createAction(createActionType(actionName), payloadCreator, metaCreator);
  };
};

/** Creates a translator that turns actionBlueprints into actionCreators */
var createActionBlueprintsTranslator = exports.createActionBlueprintsTranslator = function createActionBlueprintsTranslator(createActionType) {
  return function (actionBlueprints) {
    assert.ok(actionBlueprints, 'actionBlueprints are required');
    if (Array.isArray(actionBlueprints)) return actionBlueprints.map(function (x) {
      return actionBlueprints(createActionType);
    });
    assert((typeof actionBlueprints === 'undefined' ? 'undefined' : _typeof(actionBlueprints)) === 'object', 'actionBlueprints must be array or object');
    return Object.keys(actionBlueprints).reduce(function (actionCreators, x) {
      actionCreators[x] = actionBlueprints[x](createActionType);
      return actionCreators;
    }, {});
  };
};

//export const createDelayableActionBlueprint = (actionName, payloadCreator, metaCreator) => delay => createActionBlueprint(actionName, payloadCreator, meta => Object.assign(metaCreator(meta), { delay }))

// metaCreator(meta) === Object.assign(meta, { delay })
// delayableActionBlueprint(delay) === actionBlueprint

// actionBlueprint(createActionType) === actionCreator

// actionDefinition === { type, payloadCreactor, ?metaCreator }