import createContext from './context'
import  { IDLEMONITOR_ACTIVITY } from './constants'

/** When context has already been created, it can be shared to middleware component. */
export const createReducer = context => {
  const { log, initialState, actionNames, useFastStore, useLocalStore, useWebRTCState, useWebSocketsState } = context
  return (state = initialState, action = {}) => {
    if(!actionNames.includes(action.type))
      return state

    const { type, payload } = action
    if(type === IDLEMONITOR_ACTIVITY) {
      if(useFastStore)
        return state
      const { lastActive, lastEvent, timeoutID } = payload
      return Object.assign({}, state, { lastActive, lastEvent, timeoutID })
    }

    const { actionName, isIdle, isPaused, lastActive, lastEvent, timeoutID } = payload
    return Object.assign({}, state, { actionName, isIdle, isPaused, lastActive, lastEvent, timeoutID })
  }
}

/** Creates reducer from opts including validation in development */
export default function configureReducer (opts) { return createReducer(createContext(opts)) }
