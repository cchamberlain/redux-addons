'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createReducer = undefined;
exports.default = configureReducer;

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** When context has already been created, it can be shared to middleware component. */
var createReducer = exports.createReducer = function createReducer(context) {
  var log = context.log;
  var initialState = context.initialState;
  var actionNames = context.actionNames;
  var useFastStore = context.useFastStore;
  var useLocalStore = context.useLocalStore;
  var useWebRTCState = context.useWebRTCState;
  var useWebSocketsState = context.useWebSocketsState;

  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
    var action = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (!actionNames.includes(action.type)) return state;

    var type = action.type;
    var payload = action.payload;

    if (type === _constants.IDLEMONITOR_ACTIVITY) {
      if (useFastStore) return state;
      var _lastActive = payload.lastActive;
      var _lastEvent = payload.lastEvent;
      var _timeoutID = payload.timeoutID;

      return Object.assign({}, state, { lastActive: _lastActive, lastEvent: _lastEvent, timeoutID: _timeoutID });
    }

    var actionName = payload.actionName;
    var isIdle = payload.isIdle;
    var isPaused = payload.isPaused;
    var lastActive = payload.lastActive;
    var lastEvent = payload.lastEvent;
    var timeoutID = payload.timeoutID;

    return Object.assign({}, state, { actionName: actionName, isIdle: isIdle, isPaused: isPaused, lastActive: lastActive, lastEvent: lastEvent, timeoutID: timeoutID });
  };
};

/** Creates reducer from opts including validation in development */
function configureReducer(opts) {
  return createReducer((0, _context2.default)(opts));
}