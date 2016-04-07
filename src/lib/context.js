import { assert } from 'chai'
import { validateOpts } from './validate'

import  { createLogger } from './log'
import { createBlueprintsTranslator } from './actionBlueprint'


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

/** Validates library creators options */
const validateLibOpts = libOptsRaw => {
  assert.ok(libOptsRaw, 'libOpts definition is required')
  const { libName, validateContext, configureAppContext, configureInitialState } = libOptsRaw
  assert(typeof libName === 'string', 'libName must be a string')
  assert(libName.length > 0, 'libName must not be empty')

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


/*
import configureContext from 'redux-addons/context'
const context = configureContext(libOpts)(appOpts)
const {  } = context
 */
export default function configureContext(libOpts) {
  if(isDev) validateLibOpts(libOpts)
  const { libName, validateContext, configureAppContext, configureInitialState } = libOpts
  return appOpts => {
    if(isDev) validateAppOpts(appOpts)
    const { appName, level } = appOpts

    const createActionType =  actionName => `${cleanActionName(libName)}_${cleanActionName(appName)}_${cleanActionName(actionName)}`
    const translateBlueprints = createBlueprintsTranslator(createActionType)

    const libContext =  { log: createLogger({ libName, level })
                        , libName
                        , appName
                        , createActionType
                        , translateBlueprints
                        }

    const appContext = configureAppContext(libContext)(appOpts)
    if(isDev) validateContext(libContext, appContext)

    return Object.assign( appContext, libContext, { get initialState() { return configureInitialState(libContext)(appContext) }
                                                  })
  }
}
