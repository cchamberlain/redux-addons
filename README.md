# redux-addons

**redux for third-party pluggable libraries**

There are unique challenges to redux library development. This package aims to orchestrate configuration to both the library creator and consumer and allow the resultant package to be easily strapped into an existing redux store and reducers.

**Disclaimer: This library is in early development. It will be changing rapidly and is not ready for production use.**

`npm i -S redux-addons`

Will install addons to:

`ES5   => 'redux-middleware/lib'`

`ES6+  => 'redux-middleware/src/lib'`

## Usage

##### my-library/actions.js

```js
import { configureAction, configureDispatcherAction, actionDefinition } from 'redux-addons/actions'

/** Creates an action that starts idle monitor when dispatched */
export const createStartDispatcher = context => dispatcher => configureDispatcherAction(context)(dispatcher)(dispatcher => {
  const { myDispatcher } = dispatcher
  myDispatcher.execute()
})
```


##### redux-addons/actions.js

```js
/**
 * Configures a Flux Standard Action creator injected with dispatch, getState and the libraries context.
 * @example <caption>Exports a Flux Standard Action creator that takes a handler injected with dispatch, getState, and the libraries context.
 * export const createSomeUserAction = configureDispatcherAction((dispatch, getState, context) => dispatcher.action.execute('create-some-user-action'))
 * @param  {function} handler: (dispatch, getState, context) => { ... }
 */
export const configureAction = handler => context => (dispatch, getState) => handler(dispatch, getState, context)

/**
 * Configures a Flux Standard Action creator injected with the libraries dispatcher and context.
 * @example <caption>Exports a Flux Standard Action creator that takes a handler injected with the libraries dispatcher and context.
 * export const createSomeUserAction = configureDispatcherAction((dispatcher, context) => dispatcher.action.execute('create-some-user-action'))
 * @param  {function} handler: (context, dispatcher) => { ... }
 */
//export const configureDispatcherAction = (handler, dispatcher) => context => (dispatch, getState) => handler(dispatcher)
export const configureDispatcherAction = context => dispatcher => handler => (dispatch, getState) => handler(dispatcher(dispatch, getState), context)


/** Allows the user of lib to define custom redux actions that will be injected with libraries context when action is dispatched */
export const actionDefinition = (actionName, actionContext) => ([ actionName, actionContext ])

```
