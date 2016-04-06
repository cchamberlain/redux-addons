/**
 * Configures a Flux Standard Action creator injected with dispatch, getState and the libraries context.
 * @example <caption>Exports a Flux Standard Action creator that takes a handler injected with dispatch, getState, and the libraries context.
 * export const createSomeUserAction = configureDispatcherAction((dispatch, getState, context) => dispatcher.action.execute('create-some-user-action'))
 * @param  {function} handler: (dispatch, getState, context) => { ... }
 */
export const configureAction = context => handler => (dispatch, getState) => handler(dispatch, getState, context)

/**
 * Configures a Flux Standard Action creator injected with the libraries dispatcher and context.
 * @example <caption>Exports a Flux Standard Action creator that takes a handler injected with the libraries dispatcher and context.
 * export const createSomeUserAction = configureDispatcherAction((dispatcher, context) => dispatcher.action.execute('create-some-user-action'))
 * @param  {function} handler: (context, dispatcher) => { ... }
 */
export const configureActionDispatcher = context => dispatcher => handler => (dispatch, getState) => handler(dispatcher(dispatch, getState), context)


/** Allows the user of lib to define custom redux actions that an action creator retrieved from at a later time via a type map. */
export const createActionBlueprint = (actionName, payloadCreator, metaCreator) => createActionType => createAction(createActionType(actionName), payloadCreator, metaCreator)
export const createDelayedActionBlueprint = (actionName, payloadCreator, delay) => createActionBlueprint(actionName, payloadCreator, () => ({ delay }))

// actionBlueprint = typeMap => actionCreator

// actionDefinition === { type, payloadCreactor, ?metaCreator }
