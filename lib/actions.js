"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Configures a Flux Standard Action creator injected with dispatch, getState and the libraries context.
 * @example <caption>Exports a Flux Standard Action creator that takes a handler injected with dispatch, getState, and the libraries context.
 * export const createSomeUserAction = configureDispatcherAction((dispatch, getState, context) => dispatcher.action.execute('create-some-user-action'))
 * @param  {function} handler: (dispatch, getState, context) => { ... }
 */
var configureAction = exports.configureAction = function configureAction(context) {
  return function (handler) {
    return function (dispatch, getState) {
      return handler(dispatch, getState, context);
    };
  };
};

/**
 * Configures a Flux Standard Action creator injected with the libraries dispatcher and context.
 * @example <caption>Exports a Flux Standard Action creator that takes a handler injected with the libraries dispatcher and context.
 * export const createSomeUserAction = configureDispatcherAction((dispatcher, context) => dispatcher.action.execute('create-some-user-action'))
 * @param  {function} handler: (context, dispatcher) => { ... }
 */
//export const configureActionDispatcher = context => dispatcher => handler => (dispatch, getState) => handler(dispatcher(dispatch, getState), context)
var configureActionDispatcher = exports.configureActionDispatcher = function configureActionDispatcher(context) {
  return function (dispatcher) {
    return function (handler) {
      return function (dispatch, getState) {
        return handler(dispatcher(dispatch, getState), context);
      };
    };
  };
};

/** Allows the user of lib to define custom redux actions that will be injected with libraries context when action is dispatched */
var actionDefinition = exports.actionDefinition = function actionDefinition(actionName, _actionDefinition) {
  return [actionName, _actionDefinition];
};