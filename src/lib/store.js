import { assert } from 'chai'
import { createAction } from 'redux-actions'

const noop = () => {}

/** Formats a string as CONST_CASE */
export const toConstCase = value => value.replace(/[- ]/, '_').toUpperCase()

/**
 * Creates a store with all functions returning noop
 * @return {Object}     Noop store object with noop dispatch, getState, subscribe, and replaceReducer functions.
 */
export const createNoopStore = () => ({ dispatch: noop, subscribe: noop, getState: noop, replaceReducer: noop })


export const configureSessionStateAccessor = opts => configureBrowserStateAccessor(sessionStorage, opts)
export const configureLocalStateAccessor = opts => configureBrowserStateAccessor(localStorage, opts)

/**
 * Configures an accessor object with getState and setState functions for interacting with browser storage.
 * @param  {Object}   browserStorage    The storage medium to use (sessionStorage / localStorage).
 * @param  {String}   options.prefix    The prefix to use for state keys.
 * @param  {Boolean}  options.useJSON   Enables serializing to a single JSON string and uses a single storage key.
 * @param  {Function} options.formatKey The formatter to use for storage keys.
 * @return {Function}                   Thunk taking initialState and returning initialized getState and setState functions.
 */
export const configureBrowserStateAccessor = (browserStorage, { prefix = 'REDUX_BROWSER'
                                                              , useJSON = false
                                                              , formatKey = (prefix, key = 'STATE') => `${toConstCase(prefix)}_${toConstCase(key)}`
                                                              } = {}) => {
  assert.ok(browserStorage, 'browserStorage is required (localStorage or sessionStorage)')
  assert(typeof browserStorage === 'object', 'browserStorage must be an object')
  assert(typeof browserStorage.setItem === 'function', 'browserStorage have same setter interface as localStorage / sessionStorage')
  assert(typeof browserStorage.getItem === 'function', 'browserStorage have same getter interface as localStorage / sessionStorage')

  const stateName = formatKey(prefix)

  /** Will create the stateAccessor and initialize it with initialState */
  return initialState => {
    assert.ok(initialState, 'initialState is required.')
    assert(typeof initialState === 'object', 'initialState must be an object.')
    const keyMap = useJSON ? noop() : new Map(Object.keys(initialState).map(x => [x, formatKey(prefix, x)]))
    const setState = (useJSON
      ? newState => {
          /** Serialize to a single JSON string and serialize that. */
          browserStorage.setItem(stateName, JSON.stringify(newState))
        }
      : newState => {
        /** Set individual storage keys. */
        for(let [key, storageKey] of keyMap.entries())
          browserStorage.setItem(storageKey, newState[key])
        }
      )

    const getState = (useJSON
      ? () => {
          const serializedState = browserStorage.getItem(stateName)
          if(serializedState)
            return JSON.parse(serializedState)
        }
      : () => {
          let newState = {}
          for(let [key, storageKey] of keyMap.entries())
            newState[key] = browserStorage.getItem(storageKey)
          return newState
        }
      )
    setState(initialState)
    return { setState, getState }
  }
}

/** Asserts that createBrowserStore options are valid. */
const assertBrowserStore = (reducer, initialState, createBrowserStateAccessor) => {
  assert.ok(reducer, 'reducer is required')
  assert(typeof reducer === 'function', 'reducer must be a function')
  assert.ok(initialState, 'initialState is required')
  assert(typeof initialState === 'object', 'initialState must be an object')
  assert.ok(createBrowserStateAccessor, 'createBrowserStateAccessor is required')
  assert(typeof createBrowserStateAccessor === 'function', 'createBrowserStateAccessor must be a function')
}

/**
 * Works the same as createStore but uses browserStorage as persistence medium.
 * @param  {!function}  localReducer - The reducer to create new state to be persisted.
 * @param  {!Object}    initialState - Initial state to create in local storage (REQUIRED).
 * @param  {String}     prefix - The local storage namespace to use.
 * @return {Object}     Local store object with dispatch, getState, subscribe, and replaceReducer functions.
 */
export const configureBrowserStore = createBrowserStateAccessor => (reducer, initialState) => {
  if(process.env.NODE_ENV !== 'production')
    assertBrowserStore(reducer, initialState, createBrowserStateAccessor)

  const { getState, setState } = createBrowserStateAccessor(initialState)
  let currentReducer = reducer
  let listeners = []
  let isDispatching = false
  const subscribe = listener => {
    listeners.push(listener)
    return () => {
      let index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    }
  }
  const dispatch = action => {
    if(isDispatching)
      throw new Error('Browser reducers may not dispatch actions.')
    try {
      isDispatching = true
      setState(currentReducer(getState(), action))
    } finally {
      isDispatching = false
    }
    listeners.slice().forEach(listener => listener())
    return action
  }
  const replaceReducer = nextReducer => {
    currentReducer = nextReducer
    dispatch({ type: '@@redux-browser/INIT' })
  }
  dispatch({ type: '@@redux-browser/INIT' })
  return  { dispatch, subscribe, getState, replaceReducer }
}

/** Configures a createSessionStore thunk that returns the same interface as redux createStore */
export const configureSessionStore = opts => {
  const createSessionStateAccessor = configureSessionStateAccessor(opts)
  return configureBrowserStore(createSessionStateAccessor)
}

/** Configures a createLocalStore thunk that returns the same interface as redux createStore */
export const configureLocalStore = opts => {
  const createLocalStateAccessor = configureLocalStateAccessor(opts)
  return configureBrowserStore(createLocalStateAccessor)
}

/**
 * Creates sessionStorage interfacing component that implements redux store interface.
 * Uses one sessionStorage key per state node. Only supports primitive state keys.
 */
export const createSessionStore = (reducer, initialState) => configureSessionStore({ useJSON: false })(reducer, initialState)

/**
 * Creates sessionStorage interfacing component that implements redux store interface.
 * Serializes / Deserializes state object to and from JSON. Supports nested structures.
 */
export const createJSONSessionStore = (reducer, initialState) => configureSessionStore({ useJSON: true })(reducer, initialState)

/**
 * Creates localStorage interfacing component that implements redux store interface.
 * Uses one localStorage key per state node. Only supports primitive state keys.
 */
export const createLocalStore = (reducer, initialState) => configureLocalStore({ useJSON: false })(reducer, initialState)

/**
 * Creates localStorage interfacing component that implements redux store interface.
 * Serializes / Deserializes state object to and from JSON. Supports nested structures.
 */
export const createJSONLocalStore = (reducer, initialState) => configureLocalStore({ useJSON: true })(reducer, initialState)

/**
 * Configures a reducer that reduces action to a state, then optionally merges with previous state for subscribed action types.
 * @param  {function} actionReducer Map the action to the object that will be merged to state.
 * @param {bool}     mergeState    Defines whether the reducer results should be merged with the previous state.
 * @return {Object}                 New state object.
 */
export const configureReducer = (actionReducer, mergeState = true) => (...subscribeTypes) => (state, action) => subscribeTypes.includes(action.type) ? (mergeState ? Object.assign({}, state, actionReducer(action)) : actionReducer(action)) : state

/**
 * Creates a reducer that merged payload with state for matching subscribe types.
 * @param  {String[]} subscribeTypes   Action types to subscribe reducer to.
 */
export const createMergingReducer = configureReducer(action => action.payload, true)

/**
 * Returns object implementing redux store interface whose getState method selects a sub tree of the overall state.
 * Useful for library components that embed state in a subnode of consumer apps redux state
 * @param  {Object}    store      A store to bisect
 * @param  {...String} selectKeys The selection path to use with getState
 * @return {Object}               A sub store implementing redux store interface
 */
export const bisectStore = (store, ...selectKeys) => {
  assert.ok(store, 'store must exist')
  assert.ok(store.dispatch, 'store must define dispatch')
  assert.ok(store.getState, 'store must define getState')
  assert(selectKeys.length > 0, 'must define one or more keys to select on')

  return  { dispatch: action => store.dispatch(action)
          , subscribe: listener => store.subscribe(listener)
          , getState: () => selectState(selectKeys, store.getState())
          }
}

/** Selects a sub state from a state tree by path. */
export const selectState = (selectKeys, state, defaultValue) => {
  assert(Array.isArray(selectKeys), 'selectKeys must be an array.')
  //assert(selectKeys.length > 0, 'must specify a selection path')
  assert.ok(state, 'state is required')
  let result = state
  while(selectKeys.length > 0 && result)
    result = state[selectKeys.shift()]
  return result || defaultValue
}




//actionDefinitionMapping === [actionName, actionDefinition]
// actionDefinition === { type, payloadCreactor, ?metaCreator }

//payloadCreator === (actionArgs => payload)
//metaCreator === (actionArgs => meta)
//const action = createAction(ACTION_TYPE, payloadCreator, metaCreator)(actionArgs)


const creatorOverride = props => creator => args => Object.assign({}, creator(args), props)

const delayOverride = delay => overrideCreator({ delay })


// TODO: MOVE THIS TO ACTIONS
export const createActionMultiplexer = actionMapping => {
  assert.ok(actionMapping, 'actionMapping is required')
  assert(Array.isArray(actionMapping), 'actionMapping must be an array')
  assert(actionMapping.every(x => Array.isArray(x) && x.length === 2), 'actionMapping must be an array of [<name>, <store>] arrays')

  const actionMap = new Map(actionMapping)

  const translators = ( { delay: delay => args => Object.assign({}, args, { delay })
                        } )


  const translateCreator = creator => translate => args => translate(typeof creator === 'function' ? creator(args) : creator, args)

  const identityTranslator = identity => identity

  const selectActionCreator = (actionName, { translatePayload = identityTranslator, translateMeta = identityTranslator } = {}) => {
    const actionDefinition = actionMap.get(actionName)
    assert.ok(actionDefinition, `action definition for actionName ${actionName} must be configured in createActionMultiplexer`)
    const { type, payloadCreator, metaCreator } = actionDefinition
    assert.ok(type, `action type must be defined for actionName => ${actionName}`)
    assert(typeof type === 'string', `action type must be string for actionName => ${actionName}`)
    return createAction ( type
                        , translateCreator(payloadCreator)(translatePayload)
                        , translateCreator(metaCreator)(translateMeta)
                        )
  }

  const selectDelayedActionCreator = (actionName, delay) => selectActionCreator(actionName, { translateMeta: translators.delay(delay) })

  const selectAction = (actionName, args) => selectActionCreator(actionName)(args)

  return { selectActionCreator, selectDelayedActionCreator, selectAction }
}




/**
 * createStoreMultiplexer([['lib', libStore], ['fast', fastStore], ['session', sessionStore], ['local', localStore]])
 * Takes in an ordered mapping of names to stores and reduces to a redux store compatible interface that can dispatch and getState to all stores or specific ones.
 * @param  {Array} storeMapping  The mapping of store names to store references.
 * @return {Object}              An object that can dispatch and getState to all stores or each individually.
 */
export const createStoreMultiplexer = (storeMapping, actionMultiplexer) => {
  assert.ok(storeMapping, 'storeMapping is required')
  assert(Array.isArray(storeMapping), 'storeMapping must be an array')
  assert(storeMapping.every(x => Array.isArray(x) && x.length === 2), 'storeMapping must be an array of [<name>, <store>] arrays')

  const storeMap = new Map(storeMapping)
  const mapReduceStores = operation => {
    let result = {}
    for(let [name, store] of storeMap.entries())
      result[name] = operation(store)
    return result
  }

  const storesLiteral = storeMapping.reduce((prev, [name, store]) => {
    prev[name] = store
    return prev
  }, {})


  const createActionDispatcher = actionName => ({ delay = 0 } = {}) => {
    return args => {
      if(delay <= 0)
        return dispatch(actionMultiplexer.selectActionCreator(actionName)(args))
      return dispatch(actionMultiplexer.selectDelayedActionCreator(actionName, delay)(args))
    }
  }

  const dispatchAction = (actionName, args, { delay = 0 } = {}) => createActionDispatcher(actionName)({ delay })(args)

  const dispatch = action => mapReduceStores(store => store.dispatch(action))
  const getState = () => mapReduceStores(store => store.getState())
  const selectFirst = (...names) => {
    for(let name of names) {
      if(storeMap.has(name))
        return storeMap.get(name)
    }
    throw new Error(`None of the requested stores exist in storeMapping | configured => ${JSON.stringify(storeMapping.map(x => x[0]))} requested => ${JSON.stringify(names)}`)
  }
  const select = (...names) => names.filter(x => storeMap.has(x)).map(x => storeMap.get(x))
  return  { ...storesLiteral
          , dispatch
          , getState
          , selectFirst
          , select
          , createActionDispatcher
          , dispatchAction
          }
}


