import { assert } from 'chai'
import { validateOpts } from './validate'

import  { createLogger } from './log'


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



const noop = () => {}
const cleanActionName = name => name.toUpperCase().replace(/-+\s+/, '_')
const configureActionName = libName => appName => actionName => `${cleanActionName(libName)}_${cleanActionName(appName)}_${cleanActionName(actionName)}`

/** Validates library creators options */
const validateLibOpts = libOptsRaw => {
  assert.ok(libOptsRaw, 'libOpts definition is required')
  const { libName, libActions, validateContext, configureAppContext, configureInitialState } = libOptsRaw
  assert(typeof libName === 'string', 'libName must be a string')
  assert(libName.length > 0, 'libName must not be empty')

  assert.ok(libActions, 'libActions must exist')
  assert(Array.isArray(libActions), 'libActions must be an array')
  assert(libActions.every(x => Array.isArray(x)), 'libActions must be an array of an array')
  assert(libActions.every(x => x.length === 2), 'every item in libActions must have length 2')
  assert(libActions.every(x => typeof x[0] === 'string'), 'every item in libActions must have first ordinal type string action name')
  assert(libActions.every(x => typeof x[1] === 'object'), 'every item in libActions must have second ordinal type object actionContext')

  assert.ok(validateContext, 'validateContext must exist')
  assert(typeof validateContext === 'function', 'validateContext must be a function')

  assert.ok(configureAppContext, 'configureAppContext must exist')
  assert(typeof configureAppContext === 'function', 'configureAppContext must be a function')

  assert.ok(configureInitialState, 'configureInitialState must exist')
  assert(typeof configureInitialState === 'function', 'configureInitialState must be a function')
}

/** Validates library consumers options */
const validateAppOpts = appOptsRaw => {
  assert.ok(appOptsRaw, 'appOpts are required')
  const { appName } = appOptsRaw

  assert(typeof appName === 'string', 'appName opt must be a string')
  assert(appName.length > 0, 'appName opt must not be empty')
}




const isDev = process.env.NODE_ENV !== 'production'

const normalizeLibOpts = libOptsRaw => {
  if(isDev) validateLibOpts(libOptsRaw)
  const { libName, libActions, validateContext, configureAppContext, configureInitialState } = libOptsRaw

  const libActionMap = new Map(libActions)
  const libActionNames = libActions.map(x => x[0])
  return  { libName
          , libActions
          , libActionMap
          , libActionNames
          , validateContext
          , configureAppContext
          , configureInitialState
          }

}
const normalizeAppOpts = appOptsRaw => {
  if(isDev) validateAppOpts(appOptsRaw)
  const { appName } = appOptsRaw
  return  { ...appOptsRaw
          }
}
/*
import configureContext from 'redux-addons/context'
const context = configureContext(libOpts)(appOpts)
const {  } = context
 */
export default function configureContext(libOptsRaw) {
  const libOpts = normalizeLibOpts(libOptsRaw)
  const { libName, libActions, libActionMap, libActionNames, validateContext, configureAppContext, configureInitialState } = libOpts
  return appOptsRaw => {
    const appOpts = normalizeAppOpts(appOptsRaw)
    const { appName, level } = appOpts

    const createActionType =  actionName => `${cleanActionName(libName)}_${cleanActionName(appName)}_${cleanActionName(actionName)}`
    const typedLibActions = libActions.map(x => [createActionType(x[0]), x[1]])
    const libActionTypes = typedLibActions.map(x => x[0])

    const getActionContextByName = actionName => actionMap.get(actionName)
    const getActionContextByType = actionType => typedActionMap.get(actionType)
    const getLibActionContextByOrdinal = ordinal => libActions[ordinal][1]

    const libContext =  { log: createLogger({ libName, level })
                        , libName
                        , libActions
                        , libActionMap
                        , libActionNames
                        , appName
                        , createActionType
                        , typedLibActions
                        , libActionTypes
                        , getActionContextByName
                        , getActionContextByType
                        , getLibActionContextByOrdinal
                        }


    const appContext = configureAppContext(libContext)(appOpts)
    if(process.env.NODE_ENV !== 'production') {
      validateContext(libContext, appContext)
    }

    return Object.assign( appContext, libContext, { get initialState() { return configureInitialState(libContext)(appContext) }
                                                  })
  }
}
