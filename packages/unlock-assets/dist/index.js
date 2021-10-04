function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var b = "function" === typeof Symbol && Symbol["for"],
    c = b ? Symbol["for"]("react.element") : 60103,
    d = b ? Symbol["for"]("react.portal") : 60106,
    e = b ? Symbol["for"]("react.fragment") : 60107,
    f = b ? Symbol["for"]("react.strict_mode") : 60108,
    g = b ? Symbol["for"]("react.profiler") : 60114,
    h = b ? Symbol["for"]("react.provider") : 60109,
    k = b ? Symbol["for"]("react.context") : 60110,
    l = b ? Symbol["for"]("react.async_mode") : 60111,
    m = b ? Symbol["for"]("react.concurrent_mode") : 60111,
    n = b ? Symbol["for"]("react.forward_ref") : 60112,
    p = b ? Symbol["for"]("react.suspense") : 60113,
    q = b ? Symbol["for"]("react.suspense_list") : 60120,
    r = b ? Symbol["for"]("react.memo") : 60115,
    t = b ? Symbol["for"]("react.lazy") : 60116,
    v = b ? Symbol["for"]("react.block") : 60121,
    w = b ? Symbol["for"]("react.fundamental") : 60117,
    x = b ? Symbol["for"]("react.responder") : 60118,
    y = b ? Symbol["for"]("react.scope") : 60119;

function z(a) {
  if ("object" === typeof a && null !== a) {
    var u = a.$$typeof;

    switch (u) {
      case c:
        switch (a = a.type, a) {
          case l:
          case m:
          case e:
          case g:
          case f:
          case p:
            return a;

          default:
            switch (a = a && a.$$typeof, a) {
              case k:
              case n:
              case t:
              case r:
              case h:
                return a;

              default:
                return u;
            }

        }

      case d:
        return u;
    }
  }
}

function A(a) {
  return z(a) === m;
}

var AsyncMode = l;
var ConcurrentMode = m;
var ContextConsumer = k;
var ContextProvider = h;
var Element = c;
var ForwardRef = n;
var Fragment = e;
var Lazy = t;
var Memo = r;
var Portal = d;
var Profiler = g;
var StrictMode = f;
var Suspense = p;

var isAsyncMode = function isAsyncMode(a) {
  return A(a) || z(a) === l;
};

var isConcurrentMode = A;

var isContextConsumer = function isContextConsumer(a) {
  return z(a) === k;
};

var isContextProvider = function isContextProvider(a) {
  return z(a) === h;
};

var isElement = function isElement(a) {
  return "object" === typeof a && null !== a && a.$$typeof === c;
};

var isForwardRef = function isForwardRef(a) {
  return z(a) === n;
};

var isFragment = function isFragment(a) {
  return z(a) === e;
};

var isLazy = function isLazy(a) {
  return z(a) === t;
};

var isMemo = function isMemo(a) {
  return z(a) === r;
};

var isPortal = function isPortal(a) {
  return z(a) === d;
};

var isProfiler = function isProfiler(a) {
  return z(a) === g;
};

var isStrictMode = function isStrictMode(a) {
  return z(a) === f;
};

var isSuspense = function isSuspense(a) {
  return z(a) === p;
};

var isValidElementType = function isValidElementType(a) {
  return "string" === typeof a || "function" === typeof a || a === e || a === m || a === g || a === f || a === p || a === q || "object" === typeof a && null !== a && (a.$$typeof === t || a.$$typeof === r || a.$$typeof === h || a.$$typeof === k || a.$$typeof === n || a.$$typeof === w || a.$$typeof === x || a.$$typeof === y || a.$$typeof === v);
};

var typeOf = z;
var reactIs_production_min = {
  AsyncMode: AsyncMode,
  ConcurrentMode: ConcurrentMode,
  ContextConsumer: ContextConsumer,
  ContextProvider: ContextProvider,
  Element: Element,
  ForwardRef: ForwardRef,
  Fragment: Fragment,
  Lazy: Lazy,
  Memo: Memo,
  Portal: Portal,
  Profiler: Profiler,
  StrictMode: StrictMode,
  Suspense: Suspense,
  isAsyncMode: isAsyncMode,
  isConcurrentMode: isConcurrentMode,
  isContextConsumer: isContextConsumer,
  isContextProvider: isContextProvider,
  isElement: isElement,
  isForwardRef: isForwardRef,
  isFragment: isFragment,
  isLazy: isLazy,
  isMemo: isMemo,
  isPortal: isPortal,
  isProfiler: isProfiler,
  isStrictMode: isStrictMode,
  isSuspense: isSuspense,
  isValidElementType: isValidElementType,
  typeOf: typeOf
};

var reactIs_development = createCommonjsModule(function (module, exports) {

  if (process.env.NODE_ENV !== "production") {
    (function () {

      var hasSymbol = typeof Symbol === 'function' && Symbol["for"];
      var REACT_ELEMENT_TYPE = hasSymbol ? Symbol["for"]('react.element') : 0xeac7;
      var REACT_PORTAL_TYPE = hasSymbol ? Symbol["for"]('react.portal') : 0xeaca;
      var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol["for"]('react.fragment') : 0xeacb;
      var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol["for"]('react.strict_mode') : 0xeacc;
      var REACT_PROFILER_TYPE = hasSymbol ? Symbol["for"]('react.profiler') : 0xead2;
      var REACT_PROVIDER_TYPE = hasSymbol ? Symbol["for"]('react.provider') : 0xeacd;
      var REACT_CONTEXT_TYPE = hasSymbol ? Symbol["for"]('react.context') : 0xeace;
      var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol["for"]('react.async_mode') : 0xeacf;
      var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol["for"]('react.concurrent_mode') : 0xeacf;
      var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol["for"]('react.forward_ref') : 0xead0;
      var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol["for"]('react.suspense') : 0xead1;
      var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol["for"]('react.suspense_list') : 0xead8;
      var REACT_MEMO_TYPE = hasSymbol ? Symbol["for"]('react.memo') : 0xead3;
      var REACT_LAZY_TYPE = hasSymbol ? Symbol["for"]('react.lazy') : 0xead4;
      var REACT_BLOCK_TYPE = hasSymbol ? Symbol["for"]('react.block') : 0xead9;
      var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol["for"]('react.fundamental') : 0xead5;
      var REACT_RESPONDER_TYPE = hasSymbol ? Symbol["for"]('react.responder') : 0xead6;
      var REACT_SCOPE_TYPE = hasSymbol ? Symbol["for"]('react.scope') : 0xead7;

      function isValidElementType(type) {
        return typeof type === 'string' || typeof type === 'function' || type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
      }

      function typeOf(object) {
        if (typeof object === 'object' && object !== null) {
          var $$typeof = object.$$typeof;

          switch ($$typeof) {
            case REACT_ELEMENT_TYPE:
              var type = object.type;

              switch (type) {
                case REACT_ASYNC_MODE_TYPE:
                case REACT_CONCURRENT_MODE_TYPE:
                case REACT_FRAGMENT_TYPE:
                case REACT_PROFILER_TYPE:
                case REACT_STRICT_MODE_TYPE:
                case REACT_SUSPENSE_TYPE:
                  return type;

                default:
                  var $$typeofType = type && type.$$typeof;

                  switch ($$typeofType) {
                    case REACT_CONTEXT_TYPE:
                    case REACT_FORWARD_REF_TYPE:
                    case REACT_LAZY_TYPE:
                    case REACT_MEMO_TYPE:
                    case REACT_PROVIDER_TYPE:
                      return $$typeofType;

                    default:
                      return $$typeof;
                  }

              }

            case REACT_PORTAL_TYPE:
              return $$typeof;
          }
        }

        return undefined;
      }

      var AsyncMode = REACT_ASYNC_MODE_TYPE;
      var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
      var ContextConsumer = REACT_CONTEXT_TYPE;
      var ContextProvider = REACT_PROVIDER_TYPE;
      var Element = REACT_ELEMENT_TYPE;
      var ForwardRef = REACT_FORWARD_REF_TYPE;
      var Fragment = REACT_FRAGMENT_TYPE;
      var Lazy = REACT_LAZY_TYPE;
      var Memo = REACT_MEMO_TYPE;
      var Portal = REACT_PORTAL_TYPE;
      var Profiler = REACT_PROFILER_TYPE;
      var StrictMode = REACT_STRICT_MODE_TYPE;
      var Suspense = REACT_SUSPENSE_TYPE;
      var hasWarnedAboutDeprecatedIsAsyncMode = false;

      function isAsyncMode(object) {
        {
          if (!hasWarnedAboutDeprecatedIsAsyncMode) {
            hasWarnedAboutDeprecatedIsAsyncMode = true;
            console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
          }
        }
        return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
      }

      function isConcurrentMode(object) {
        return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
      }

      function isContextConsumer(object) {
        return typeOf(object) === REACT_CONTEXT_TYPE;
      }

      function isContextProvider(object) {
        return typeOf(object) === REACT_PROVIDER_TYPE;
      }

      function isElement(object) {
        return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
      }

      function isForwardRef(object) {
        return typeOf(object) === REACT_FORWARD_REF_TYPE;
      }

      function isFragment(object) {
        return typeOf(object) === REACT_FRAGMENT_TYPE;
      }

      function isLazy(object) {
        return typeOf(object) === REACT_LAZY_TYPE;
      }

      function isMemo(object) {
        return typeOf(object) === REACT_MEMO_TYPE;
      }

      function isPortal(object) {
        return typeOf(object) === REACT_PORTAL_TYPE;
      }

      function isProfiler(object) {
        return typeOf(object) === REACT_PROFILER_TYPE;
      }

      function isStrictMode(object) {
        return typeOf(object) === REACT_STRICT_MODE_TYPE;
      }

      function isSuspense(object) {
        return typeOf(object) === REACT_SUSPENSE_TYPE;
      }

      exports.AsyncMode = AsyncMode;
      exports.ConcurrentMode = ConcurrentMode;
      exports.ContextConsumer = ContextConsumer;
      exports.ContextProvider = ContextProvider;
      exports.Element = Element;
      exports.ForwardRef = ForwardRef;
      exports.Fragment = Fragment;
      exports.Lazy = Lazy;
      exports.Memo = Memo;
      exports.Portal = Portal;
      exports.Profiler = Profiler;
      exports.StrictMode = StrictMode;
      exports.Suspense = Suspense;
      exports.isAsyncMode = isAsyncMode;
      exports.isConcurrentMode = isConcurrentMode;
      exports.isContextConsumer = isContextConsumer;
      exports.isContextProvider = isContextProvider;
      exports.isElement = isElement;
      exports.isForwardRef = isForwardRef;
      exports.isFragment = isFragment;
      exports.isLazy = isLazy;
      exports.isMemo = isMemo;
      exports.isPortal = isPortal;
      exports.isProfiler = isProfiler;
      exports.isStrictMode = isStrictMode;
      exports.isSuspense = isSuspense;
      exports.isValidElementType = isValidElementType;
      exports.typeOf = typeOf;
    })();
  }
});

var reactIs = createCommonjsModule(function (module) {

  if (process.env.NODE_ENV === 'production') {
    module.exports = reactIs_production_min;
  } else {
    module.exports = reactIs_development;
  }
});

var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
  if (val === null || val === undefined) {
    throw new TypeError('Object.assign cannot be called with null or undefined');
  }

  return Object(val);
}

function shouldUseNative() {
  try {
    if (!Object.assign) {
      return false;
    }

    var test1 = new String('abc');
    test1[5] = 'de';

    if (Object.getOwnPropertyNames(test1)[0] === '5') {
      return false;
    }

    var test2 = {};

    for (var i = 0; i < 10; i++) {
      test2['_' + String.fromCharCode(i)] = i;
    }

    var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
      return test2[n];
    });

    if (order2.join('') !== '0123456789') {
      return false;
    }

    var test3 = {};
    'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
      test3[letter] = letter;
    });

    if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
  var from;
  var to = toObject(target);
  var symbols;

  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }

    if (getOwnPropertySymbols) {
      symbols = getOwnPropertySymbols(from);

      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }

  return to;
};

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
var ReactPropTypesSecret_1 = ReactPropTypesSecret;

var printWarning = function printWarning() {};

if (process.env.NODE_ENV !== 'production') {
  var ReactPropTypesSecret$1 = ReactPropTypesSecret_1;
  var loggedTypeFailures = {};
  var has = Function.call.bind(Object.prototype.hasOwnProperty);

  printWarning = function printWarning(text) {
    var message = 'Warning: ' + text;

    if (typeof console !== 'undefined') {
      console.error(message);
    }

    try {
      throw new Error(message);
    } catch (x) {}
  };
}

function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error;

        try {
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.');
            err.name = 'Invariant Violation';
            throw err;
          }

          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret$1);
        } catch (ex) {
          error = ex;
        }

        if (error && !(error instanceof Error)) {
          printWarning((componentName || 'React class') + ': type specification of ' + location + ' `' + typeSpecName + '` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a ' + typeof error + '. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).');
        }

        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          loggedTypeFailures[error.message] = true;
          var stack = getStack ? getStack() : '';
          printWarning('Failed ' + location + ' type: ' + error.message + (stack != null ? stack : ''));
        }
      }
    }
  }
}

checkPropTypes.resetWarningCache = function () {
  if (process.env.NODE_ENV !== 'production') {
    loggedTypeFailures = {};
  }
};

var checkPropTypes_1 = checkPropTypes;

var has$1 = Function.call.bind(Object.prototype.hasOwnProperty);

var printWarning$1 = function printWarning() {};

if (process.env.NODE_ENV !== 'production') {
  printWarning$1 = function printWarning(text) {
    var message = 'Warning: ' + text;

    if (typeof console !== 'undefined') {
      console.error(message);
    }

    try {
      throw new Error(message);
    } catch (x) {}
  };
}

function emptyFunctionThatReturnsNull() {
  return null;
}

var factoryWithTypeCheckers = function factoryWithTypeCheckers(isValidElement, throwOnDirectAccess) {
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';

  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);

    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  var ANONYMOUS = '<<anonymous>>';
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),
    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    elementType: createElementTypeTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker,
    exact: createStrictShapeTypeChecker
  };

  function is(x, y) {
    if (x === y) {
      return x !== 0 || 1 / x === 1 / y;
    } else {
      return x !== x && y !== y;
    }
  }

  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }

  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }

    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret_1) {
        if (throwOnDirectAccess) {
          var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use `PropTypes.checkPropTypes()` to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
          err.name = 'Invariant Violation';
          throw err;
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          var cacheKey = componentName + ':' + propName;

          if (!manualPropTypeCallCache[cacheKey] && manualPropTypeWarningCount < 3) {
            printWarning$1('You are manually calling a React.PropTypes validation ' + 'function for the `' + propFullName + '` prop on `' + componentName + '`. This is deprecated ' + 'and will throw in the standalone `prop-types` package. ' + 'You may be seeing this warning due to a third-party PropTypes ' + 'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.');
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }

      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }

          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }

        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);
    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);

      if (propType !== expectedType) {
        var preciseType = getPreciseType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunctionThatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }

      var propValue = props[propName];

      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }

      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret_1);

        if (error instanceof Error) {
          return error;
        }
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];

      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createElementTypeTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];

      if (!reactIs.isValidElementType(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      if (process.env.NODE_ENV !== 'production') {
        if (arguments.length > 1) {
          printWarning$1('Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' + 'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).');
        } else {
          printWarning$1('Invalid argument supplied to oneOf, expected an array.');
        }
      }

      return emptyFunctionThatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];

      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
        var type = getPreciseType(value);

        if (type === 'symbol') {
          return String(value);
        }

        return value;
      });
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }

    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }

      var propValue = props[propName];
      var propType = getPropType(propValue);

      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }

      for (var key in propValue) {
        if (has$1(propValue, key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);

          if (error instanceof Error) {
            return error;
          }
        }
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? printWarning$1('Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunctionThatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];

      if (typeof checker !== 'function') {
        printWarning$1('Invalid argument supplied to oneOfType. Expected an array of check functions, but ' + 'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.');
        return emptyFunctionThatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];

        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret_1) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }

    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);

      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }

      for (var key in shapeTypes) {
        var checker = shapeTypes[key];

        if (!checker) {
          continue;
        }

        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);

        if (error) {
          return error;
        }
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createStrictShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);

      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }

      var allKeys = objectAssign({}, props[propName], shapeTypes);

      for (var key in allKeys) {
        var checker = shapeTypes[key];

        if (!checker) {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' + '\nBad object: ' + JSON.stringify(props[propName], null, '  ') + '\nValid keys: ' + JSON.stringify(Object.keys(shapeTypes), null, '  '));
        }

        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);

        if (error) {
          return error;
        }
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;

      case 'boolean':
        return !propValue;

      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }

        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);

        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;

          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            while (!(step = iterator.next()).done) {
              var entry = step.value;

              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;

      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    if (propType === 'symbol') {
      return true;
    }

    if (!propValue) {
      return false;
    }

    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  function getPropType(propValue) {
    var propType = typeof propValue;

    if (Array.isArray(propValue)) {
      return 'array';
    }

    if (propValue instanceof RegExp) {
      return 'object';
    }

    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }

    return propType;
  }

  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }

    var propType = getPropType(propValue);

    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }

    return propType;
  }

  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);

    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;

      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;

      default:
        return type;
    }
  }

  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }

    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes_1;
  ReactPropTypes.resetWarningCache = checkPropTypes_1.resetWarningCache;
  ReactPropTypes.PropTypes = ReactPropTypes;
  return ReactPropTypes;
};

function emptyFunction() {}

function emptyFunctionWithReset() {}

emptyFunctionWithReset.resetWarningCache = emptyFunction;

var factoryWithThrowingShims = function factoryWithThrowingShims() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret_1) {
      return;
    }

    var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use PropTypes.checkPropTypes() to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
    err.name = 'Invariant Violation';
    throw err;
  }
  shim.isRequired = shim;

  function getShim() {
    return shim;
  }
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,
    any: shim,
    arrayOf: getShim,
    element: shim,
    elementType: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim,
    checkPropTypes: emptyFunctionWithReset,
    resetWarningCache: emptyFunction
  };
  ReactPropTypes.PropTypes = ReactPropTypes;
  return ReactPropTypes;
};

var propTypes = createCommonjsModule(function (module) {
  if (process.env.NODE_ENV !== 'production') {
    var ReactIs = reactIs;
    var throwOnDirectAccess = true;
    module.exports = factoryWithTypeCheckers(ReactIs.isElement, throwOnDirectAccess);
  } else {
    module.exports = factoryWithThrowingShims();
  }
});

var _excluded = ["title", "titleId"];

var SvgAbout = function SvgAbout(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 20 20",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12.522 11.121c.023-.165.032-.334.032-.5l.001-1.724v-.432H7.577a3914.548 3914.548 0 000 2.225c.001 1.083.656 1.985 1.702 2.35 1.43.5 3.044-.454 3.243-1.919zm2.981-7.096v.178a860.597 860.597 0 01-.005 2.866h.825v1.446h-.825c0 .725.003 1.449.01 2.173.022 2.295-1.451 4.179-3.416 4.902-2.075.763-4.02.466-5.74-.929-1.195-.967-1.839-2.25-1.852-3.796-.007-.783-.009-1.566-.01-2.35h-.815V7.07h.816l.001-.894.002-2.055c0-.018.002-.036.004-.056l.003-.035h3.05v3.04h4.892V4.025h3.06z"
  }));
};

SvgAbout.propTypes = {
  title: propTypes.string
};
SvgAbout.defaultProps = {
  title: ''
};

var _excluded$1 = ["title", "titleId"];

var SvgAdfree = function SvgAdfree(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$1);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M25.567 4.254l2.756-1.965L27.091.713.851 19.424 2.084 21l9.116-6.5.781 2.5h3.682L14 12.502l2.707-1.93V17h4.678c1.23-.006 2.344-.3 3.34-.879a6.03 6.03 0 002.324-2.422c.553-1.035.83-2.203.83-3.505v-.655c-.007-1.289-.293-2.451-.86-3.486a6.022 6.022 0 00-1.452-1.799zm-2.442 1.741l-2.99 2.133v6.235h1.191c.983 0 1.738-.348 2.266-1.044.527-.704.79-1.745.79-3.126v-.615c0-1.373-.263-2.409-.79-3.105a2.592 2.592 0 00-.466-.478z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21.287 2.781c.136 0 .27.004.402.01l-4.982 3.553V2.78h4.58zM10.408 2.781l2.356 6.375-2.639 1.882-1.328-4.272-1.524 4.931H9.2L2.044 16.8 7.186 2.78h3.222z"
  }));
};

SvgAdfree.propTypes = {
  title: propTypes.string
};
SvgAdfree.defaultProps = {
  title: ''
};

var _excluded$2 = ["title", "titleId"];

var SvgAppStore = function SvgAppStore(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$2);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M11.766 4.56a.5.5 0 01.472 0l5.998 3.215a.5.5 0 01.264.441v7.566a.5.5 0 01-.264.44l-6 3.219a.5.5 0 01-.474 0l-5.999-3.222a.5.5 0 01-.263-.441l.004-7.562a.5.5 0 01.264-.44l5.998-3.217zM6.504 9.04l4.995 2.609v6.515L6.5 15.479l.004-6.438zm5.995 9.125l5.001-2.682V9.041l-5.001 2.608v6.516zm-.5-7.383L16.93 8.21l-4.928-2.643L7.073 8.21 12 10.782z"
  }));
};

SvgAppStore.propTypes = {
  title: propTypes.string
};
SvgAppStore.defaultProps = {
  title: ''
};

var _excluded$3 = ["title", "titleId"];

var SvgArrow = function SvgArrow(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$3);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M17.5 12a.5.5 0 01-.175.38l-3.5 3a.5.5 0 11-.65-.76l2.473-2.12H7a.5.5 0 010-1h8.648l-2.473-2.12a.5.5 0 11.65-.76l3.5 3a.5.5 0 01.175.38z"
  }));
};

SvgArrow.propTypes = {
  title: propTypes.string
};
SvgArrow.defaultProps = {
  title: ''
};

var _excluded$4 = ["title", "titleId"];

var SvgAttention = function SvgAttention(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$4);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 96 96",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M95.316 84.437L53.012 5.663c-1.008-1.878-2.88-2.996-5.011-2.996-2.131 0-4.003 1.12-5.011 2.997L.684 84.437a5.64 5.64 0 00.13 5.61 5.642 5.642 0 004.882 2.769h84.608a5.645 5.645 0 004.883-2.769 5.64 5.64 0 00.129-5.61zM46.513 7.557L4.208 86.33c-.29.54-.276 1.14.038 1.663.315.527.836.823 1.45.823h84.608c.613 0 1.136-.296 1.45-.823a1.641 1.641 0 00.038-1.663L49.489 7.556c-.312-.58-.83-.89-1.488-.89-.656 0-1.175.31-1.487.891zm-.576 40.29l-2.424-9.582a4.654 4.654 0 01.699-4.187A4.656 4.656 0 0148 32.161c1.511 0 2.892.7 3.788 1.917a4.653 4.653 0 01.7 4.187l-2.425 9.582L48 56l-2.063-8.153zm10.405-8.509a8.652 8.652 0 00-1.332-7.63A8.66 8.66 0 0048 28.16a8.655 8.655 0 00-7.011 3.548 8.652 8.652 0 00-1.331 7.63l4.464 17.642a4 4 0 007.756 0l4.464-17.643zM48 64.636a7.518 7.518 0 00-7.514 7.514A7.518 7.518 0 0048 79.664a7.518 7.518 0 007.514-7.514A7.518 7.518 0 0048 64.636zm0 4a3.518 3.518 0 00-3.514 3.514A3.518 3.518 0 0048 75.664a3.518 3.518 0 003.514-3.514A3.518 3.518 0 0048 68.636z"
  }));
};

SvgAttention.propTypes = {
  title: propTypes.string
};
SvgAttention.defaultProps = {
  title: ''
};

var _excluded$5 = ["title", "titleId"];

var SvgBars = function SvgBars(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$5);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M0 6h56V0H0v6zm0 18h56v-6H0v6zm0 18h56v-6H0v6z"
  }));
};

SvgBars.propTypes = {
  title: propTypes.string
};
SvgBars.defaultProps = {
  title: ''
};

var _excluded$6 = ["title", "titleId"];

var SvgBlog = function SvgBlog(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$6);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    clipRule: "evenodd",
    d: "M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M19 7a1 1 0 00-1-1H6a1 1 0 00-1 1v10a1 1 0 001 1h5v2a.5.5 0 00.8.4L15 18h3a1 1 0 001-1V7zM8 10a1 1 0 001 1h6a1 1 0 100-2H9a1 1 0 00-1 1zm1 5a1 1 0 110-2h6a1 1 0 110 2H9z"
  }));
};

SvgBlog.propTypes = {
  title: propTypes.string
};
SvgBlog.defaultProps = {
  title: ''
};

var _excluded$7 = ["title", "titleId"];

var SvgCarret = function SvgCarret(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$7);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M0 0h12L6 8 0 0z"
  }));
};

SvgCarret.propTypes = {
  title: propTypes.string
};
SvgCarret.defaultProps = {
  title: ''
};

var _excluded$8 = ["title", "titleId"];

var SvgCart = function SvgCart(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$8);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M1 .5a.5.5 0 000 1h2.257l.317 1.589L4.64 9.746a.51.51 0 00.003.019l.212 1.059a2.5 2.5 0 002.451 2.01h8.36a.5.5 0 100-1h-8.36a1.5 1.5 0 01-1.47-1.207l-.093-.46h8.78a2.5 2.5 0 002.488-2.252l.486-4.865A.5.5 0 0017 2.5H4.477L4.157.902A.5.5 0 003.667.5H1zm4.56 8.667L4.653 3.5h11.795l-.432 4.316a1.5 1.5 0 01-1.493 1.35H5.56zm-1.06 6.5a1.833 1.833 0 113.667 0 1.833 1.833 0 01-3.667 0zm1.833-.834a.833.833 0 100 1.667.833.833 0 000-1.667zm6.167.834a1.833 1.833 0 113.667 0 1.833 1.833 0 01-3.667 0zm1.833-.834a.833.833 0 100 1.667.833.833 0 000-1.667z"
  }));
};

SvgCart.propTypes = {
  title: propTypes.string
};
SvgCart.defaultProps = {
  title: ''
};

var _excluded$9 = ["title", "titleId"];

var SvgCheckmark = function SvgCheckmark(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$9);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M16.857 7.6a.5.5 0 01.099.7l-5.32 7.07a.5.5 0 01-.704.096l-3.236-2.482a.5.5 0 11.608-.794l2.836 2.175L16.157 7.7a.5.5 0 01.7-.098z"
  }));
};

SvgCheckmark.propTypes = {
  title: propTypes.string
};
SvgCheckmark.defaultProps = {
  title: ''
};

var _excluded$a = ["title", "titleId"];

var SvgChevronUp = function SvgChevronUp(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$a);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M26.965.796a3 3 0 014.07 0l26 24a3 3 0 11-4.07 4.408L29 7.083 5.035 29.204a3 3 0 01-4.07-4.408l26-24z"
  }));
};

SvgChevronUp.propTypes = {
  title: propTypes.string
};
SvgChevronUp.defaultProps = {
  title: ''
};

var _excluded$b = ["title", "titleId"];

var SvgClose = function SvgClose(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$b);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M8.237 7.177a.75.75 0 10-1.06 1.06L10.939 12l-3.762 3.763a.75.75 0 101.06 1.06L12 13.061l3.763 3.762a.75.75 0 101.06-1.06L13.061 12l3.762-3.763a.75.75 0 00-1.06-1.06L12 10.939 8.237 7.177z"
  }));
};

SvgClose.propTypes = {
  title: propTypes.string
};
SvgClose.defaultProps = {
  title: ''
};

var _excluded$c = ["title", "titleId"];

var SvgCloudflare = function SvgCloudflare(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$c);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M16.354 14.954c.246.345.303.81.155 1.316l-.12.429a.217.217 0 01-.204.154H.204a.173.173 0 01-.169-.147A4.429 4.429 0 010 16.178a3.634 3.634 0 013.531-3.636 2.562 2.562 0 012.223-3.18 2.584 2.584 0 011.793.5 5.69 5.69 0 0110.938.583.28.28 0 01-.014.17l-.5 1.3c-.393 1.028-1.518 1.865-2.553 1.914l-8.736.112a.237.237 0 00-.204.155.194.194 0 00.021.155.16.16 0 00.134.07l8.659.113c.457.02.837.204 1.062.52zm2.912-4.248A4.739 4.739 0 0124 15.433c0 .443-.063.872-.176 1.28a.173.173 0 01-.169.126h-6.598c-.077 0-.126-.07-.098-.14l.14-.359c.395-1.027 1.513-1.864 2.554-1.913l1.92-.113a.238.238 0 00.204-.155.198.198 0 00-.02-.154.16.16 0 00-.135-.07l-1.842-.113c-.458-.021-.837-.204-1.063-.52-.246-.345-.302-.81-.154-1.316l.337-1.175c.022-.056.07-.098.127-.098.077-.007.162-.007.24-.007z"
  }));
};

SvgCloudflare.propTypes = {
  title: propTypes.string
};
SvgCloudflare.defaultProps = {
  title: ''
};

var _excluded$d = ["title", "titleId"];

var SvgCode = function SvgCode(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$d);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M9.697 17.808a.5.5 0 01-.27-.654l4.616-11.077a.5.5 0 11.923.385l-4.615 11.076a.5.5 0 01-.654.27zm6.478-1.928a.5.5 0 01-.055-.705L18.841 12l-2.72-3.175a.5.5 0 11.759-.65l3 3.5a.5.5 0 010 .65l-3 3.5a.5.5 0 01-.705.055zM7.88 8.825a.5.5 0 00-.76-.65l-3 3.5a.5.5 0 000 .65l3 3.5a.5.5 0 10.76-.65L5.159 12l2.72-3.175z"
  }));
};

SvgCode.propTypes = {
  title: propTypes.string
};
SvgCode.defaultProps = {
  title: ''
};

var _excluded$e = ["title", "titleId"];

var SvgCog = function SvgCog(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$e);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M17.918 13.167c.598 0 1.082-.485 1.082-1.082v-.168c0-.598-.485-1.084-1.084-1.084-.505 0-.932-.354-1.124-.822l-.017-.042c-.192-.456-.142-.997.207-1.347a1.06 1.06 0 000-1.5l-.158-.158a1.042 1.042 0 00-1.48.006c-.343.35-.878.4-1.328.206a4.106 4.106 0 00-.048-.02c-.455-.191-.801-.607-.801-1.1 0-.583-.473-1.056-1.056-1.056h-.221c-.584 0-1.057.473-1.057 1.056 0 .493-.345.91-.803 1.092l-.075.03c-.46.192-1.005.142-1.358-.209a1.07 1.07 0 00-1.508.002l-.152.15a1.06 1.06 0 00-.002 1.5c.349.35.398.89.205 1.345a5.246 5.246 0 00-.033.08c-.182.448-.59.787-1.073.787-.571 0-1.034.463-1.034 1.034v.266c0 .57.463 1.034 1.034 1.034.483 0 .891.339 1.073.787l.03.073c.193.455.143.996-.207 1.345a1.06 1.06 0 000 1.498l.145.146a1.078 1.078 0 001.518.005c.356-.35.902-.4 1.364-.208l.068.028c.46.184.808.603.808 1.098 0 .586.475 1.061 1.06 1.061h.213c.586 0 1.06-.475 1.06-1.061 0-.495.35-.914.806-1.105l.04-.017c.452-.195.99-.145 1.336.204a1.05 1.05 0 001.49.002l.15-.151a1.06 1.06 0 00-.002-1.499c-.35-.35-.4-.891-.209-1.347l.015-.035c.193-.468.62-.824 1.126-.824zm-5.962.578a1.75 1.75 0 110-3.5 1.75 1.75 0 010 3.5z"
  }));
};

SvgCog.propTypes = {
  title: propTypes.string
};
SvgCog.defaultProps = {
  title: ''
};

var _excluded$f = ["title", "titleId"];

var SvgCoinbaseWallet = function SvgCoinbaseWallet(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$f);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 120 120",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M60 108.75c26.924 0 48.75-21.826 48.75-48.75S86.924 11.25 60 11.25 11.25 33.076 11.25 60 33.076 108.75 60 108.75z",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M111 0H9C4.02 0 0 4.02 0 9v102c0 4.98 4.02 9 9 9h102c4.98 0 9-4.02 9-9V9c0-4.98-4.02-9-9-9zM60 101.82c-23.1 0-41.82-18.72-41.82-41.82S36.9 18.18 60 18.18 101.82 36.9 101.82 60 83.1 101.82 60 101.82zm12.09-55.11H47.91c-.66 0-1.2.54-1.2 1.2v24.18c0 .66.54 1.2 1.2 1.2h24.18c.66 0 1.2-.54 1.2-1.2V47.91c0-.66-.54-1.2-1.2-1.2z",
    fill: "url(#coinbase-wallet_svg__paint0_linear)"
  }), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "coinbase-wallet_svg__paint0_linear",
    x1: 60,
    y1: 8.045,
    x2: 60,
    y2: 113.754,
    gradientUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: 0.002,
    stopColor: "#2E66F9"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 1,
    stopColor: "#124BDC"
  }))));
};

SvgCoinbaseWallet.propTypes = {
  title: propTypes.string
};
SvgCoinbaseWallet.defaultProps = {
  title: ''
};

var _excluded$g = ["title", "titleId"];

var SvgCopy = function SvgCopy(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$g);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M10 6v1h4V6h-4zm5 4.5a.5.5 0 00-.5-.5h-5a.5.5 0 000 1h5a.5.5 0 00.5-.5zm0 2a.5.5 0 00-.5-.5h-5a.5.5 0 000 1h5a.5.5 0 00.5-.5zm0 2a.5.5 0 00-.5-.5h-5a.5.5 0 000 1h5a.5.5 0 00.5-.5zM8 17h8V7h-1v1H9V7H8v10zm2-12a1 1 0 00-1 1H8a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V7a1 1 0 00-1-1h-1a1 1 0 00-1-1h-4z"
  }));
};

SvgCopy.propTypes = {
  title: propTypes.string
};
SvgCopy.defaultProps = {
  title: ''
};

var _excluded$h = ["title", "titleId"];

var SvgCreditCard = function SvgCreditCard(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$h);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M.25 14.4c0 .424.18.831.502 1.131.322.3.758.469 1.212.469h20.572c.454 0 .89-.169 1.212-.469.321-.3.502-.707.502-1.131v-8h-24v8zm3.429-3.2h6.857v1.6H3.679v-1.6zM22.536 0H1.964C1.51 0 1.074.169.752.469.431.769.25 1.176.25 1.6v1.6h24V1.6c0-.424-.18-.831-.502-1.131A1.778 1.778 0 0022.536 0z"
  }));
};

SvgCreditCard.propTypes = {
  title: propTypes.string
};
SvgCreditCard.defaultProps = {
  title: ''
};

var _excluded$i = ["title", "titleId"];

var SvgDecentraland = function SvgDecentraland(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$i);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M235.1 61.1c-44.4 5-85.7 24.8-117.4 56.3-41.6 41.4-62.5 99.7-56.7 157.7 6.2 61.3 40.4 115.7 93 148.2 76.4 47.1 177 34.9 240.6-29 52.4-52.7 70.6-129.7 47.3-199.8-23.2-69.6-82.3-120-154.9-132-11.6-1.9-40.5-2.7-51.9-1.4zm40 8c55.5 5.6 105.9 36.1 137.4 83 7.5 11.1 17.6 31.9 21.9 44.9 15.5 46.9 12 97.3-9.9 141.5-6.6 13.5-13.9 25.5-15.2 25.4-.5 0-20.1-23.4-43.8-51.9l-43.7-51.9c-.4-.1-10.5 11.6-22.5 25.9-11.9 14.3-22 25.9-22.5 25.8-.4-.2-21.2-28-46.1-61.7l-46.1-61.5c-.5-.1-23.7 30.8-51.5 68.6L81.9 326c-.3 0-2-4.2-3.7-9.3-13.8-40.5-13.3-85.9 1.4-125.5 30-80.6 110.4-130.8 195.5-122.1zm-94.9 261.1c-.5.5-21.2.7-46 .6l-45.3-.3 35.8-48.5 45.8-62 10-13.5.3 61.4-.6 62.3zm49.7-67.8l40.7 56c.4 1-1.2 3.6-4.1 7.1l-4.7 5.5H189v-61.5l.4-61.5c.3 0 18.5 24.5 40.5 54.4zm87.8 104.3c-.2.2-17.2.2-37.7.1l-37.2-.3 37.3-44.9 37.4-44.8.3 44.7-.1 45.2zm47.2-43l35.1 42.8c0 .3-16.6.5-37 .5h-37v-44.7c0-43.7 0-44.7 1.9-42.8 1 1.1 17.6 21 37 44.2zm-114.1 20.5l-11.7 14-7.3 8.8H104.1l-5.4-8.3c-4.9-7.4-10.7-17.8-10.7-19.2 0-.3 37.6-.5 83.6-.5h83.6l-4.4 5.2zm148.4 33.6c-3.5 4.8-22.4 22.6-30.3 28.5-67.9 50.1-158.9 50.1-225.9-.2-8-6-26.9-23.7-30.1-28.3l-2-2.8h290.2l-1.9 2.8zM190.6 109.6c-7 2.2-14.9 10.3-17 17.4-.9 3-1.6 7-1.6 9 0 15 13 28 28 28s28-13 28-28c0-15.2-13.2-28.2-28.4-27.9-2.3 0-6.3.7-9 1.5zm20.4 9.8c5.9 3.9 8.5 8.9 8.5 16.6 0 7.8-2.6 12.7-8.8 16.8-5.6 3.7-15.3 3.9-21 .3-7.6-4.7-11.1-14-8.8-22.9 1.4-5.1 7.5-11.7 12.3-13.1 5.3-1.6 13.5-.6 17.8 2.3zm96.5 19.5c-17.2 4.9-30.8 18.5-35.9 36-2 6.9-2.1 19.9-.1 27.6 2.3 8.7 6.2 15.2 13.7 22.8 20.5 20.8 53.8 20.5 73.7-.8 10.1-10.9 14.4-21.9 14.3-36.6-.2-28.6-23.3-51.1-52.2-50.8-4.1 0-10.2.8-13.5 1.8zm31.9 9.9c3.9 1.8 9.1 5.4 12.5 8.7 26 24.8 12.4 68-23.3 74.6-18.3 3.4-38.1-7-46.7-24.6-3.3-6.7-3.4-7.4-3.4-18.5 0-10.9.2-11.9 3.2-18.2 5.5-11.7 14.7-19.8 27.1-23.9 8.9-3 21.9-2.2 30.6 1.9z"
  }));
};

SvgDecentraland.propTypes = {
  title: propTypes.string
};
SvgDecentraland.defaultProps = {
  title: ''
};

var _excluded$j = ["title", "titleId"];

var SvgDiscord = function SvgDiscord(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$j);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M16.37 18.465c.617.761 1.357 1.646 1.357 1.646 4.306-.137 6.084-2.802 6.258-3.064l.015-.021c0-6.56-2.961-11.887-2.961-11.887C18.098 2.939 15.28 3 15.28 3l-.288.33c3.496 1.048 5.121 2.59 5.121 2.59a17.096 17.096 0 00-6.19-1.953 17.4 17.4 0 00-4.154.04c-.108 0-.2.017-.304.034l-.046.008c-.72.082-2.468.33-4.668 1.296-.761.329-1.214.575-1.214.575s1.687-1.624 5.388-2.673L8.72 3S5.923 2.938 2.96 5.14c0 0-2.961 5.327-2.961 11.887 0 0 1.728 2.961 6.272 3.105 0 0 .761-.905 1.378-1.686-2.611-.782-3.599-2.406-3.599-2.406s.206.144.576.35c.013 0 .026.007.043.018.011.007.024.015.04.023.03.02.061.035.092.05.03.016.062.032.093.052.514.288 1.028.514 1.5.7.844.35 1.852.658 3.024.884 1.542.288 3.352.39 5.326.02a14.747 14.747 0 002.982-.884c.72-.267 1.522-.658 2.366-1.213 0 0-1.029 1.665-3.723 2.426zm-2.797-5.614c0-1.254.926-2.262 2.098-2.262 1.152 0 2.098 1.008 2.098 2.262 0 1.255-.926 2.262-2.098 2.262-1.152 0-2.098-1.007-2.098-2.262zm-7.506 0c0-1.254.925-2.262 2.098-2.262 1.172 0 2.118 1.008 2.097 2.262 0 1.255-.925 2.262-2.097 2.262-1.152 0-2.098-1.007-2.098-2.262z"
  }));
};

SvgDiscord.propTypes = {
  title: propTypes.string
};
SvgDiscord.defaultProps = {
  title: ''
};

var _excluded$k = ["title", "titleId"];

var SvgDiscourse = function SvgDiscourse(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$k);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M0 11.79C0 5.279 5.532 0 12.103 0 18.666 0 24 5.486 24 11.996c0 6.51-5.33 11.992-11.9 11.992L0 24V11.79zm11.848-7.972a7.405 7.405 0 014.82 2.214c.527.396 1.001.863 1.408 1.392l-.005-.005.02.025a7.258 7.258 0 01.814 9.675 7.381 7.381 0 01-4.444 2.778 7.431 7.431 0 01-5.182-.858l-4.876.57H4.4h.002-.002.002v-.002h-.002l.007-.024.872-4.343a7.256 7.256 0 01-1.213-5.186 7.293 7.293 0 012.66-4.626 7.421 7.421 0 015.121-1.61zM4.42 19.603l-.017.006v-.002l.017-.004z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.071 7.426a7.262 7.262 0 011.51 4.499 7.264 7.264 0 01-1.595 4.47 7.38 7.38 0 01-4.028 2.558 7.436 7.436 0 01-4.765-.43L4.401 19.61l4.878-.572a7.43 7.43 0 005.182.859 7.381 7.381 0 004.443-2.778 7.258 7.258 0 00-.833-9.693z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5.735 15.353a7.25 7.25 0 01-.764-4.818 7.294 7.294 0 012.465-4.222 7.415 7.415 0 014.596-1.744 7.42 7.42 0 014.681 1.509 7.404 7.404 0 00-4.865-2.26 7.421 7.421 0 00-5.12 1.61 7.293 7.293 0 00-2.66 4.626A7.256 7.256 0 005.28 15.24l-.877 4.37 1.332-4.257z"
  }));
};

SvgDiscourse.propTypes = {
  title: propTypes.string
};
SvgDiscourse.defaultProps = {
  title: ''
};

var _excluded$l = ["title", "titleId"];

var SvgDocs = function SvgDocs(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$l);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M1 0a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V1a1 1 0 00-1-1H1zm2 4a1 1 0 010-2h6a1 1 0 110 2H3zM2 7a1 1 0 001 1h6a1 1 0 100-2H3a1 1 0 00-1 1zm1 5a1 1 0 110-2h4a1 1 0 110 2H3z"
  }));
};

SvgDocs.propTypes = {
  title: propTypes.string
};
SvgDocs.defaultProps = {
  title: ''
};

var _excluded$m = ["title", "titleId"];

var SvgDocumentation = function SvgDocumentation(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$m);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M6.385 2.959c0-.788.614-1.498 1.482-1.498H51.198c.843 0 1.494.687 1.494 1.5v5.885h3.423a1.5 1.5 0 011.5 1.5v38.27a1 1 0 01-.282.696L44.779 62.235a1 1 0 01-.718.303H15.27c-.821 0-1.5-.661-1.5-1.497v-5.887H7.885c-.822 0-1.5-.662-1.5-1.498V2.96zm44.307.502v5.385H15.27c-.821 0-1.5.662-1.5 1.497v42.81H8.385V3.462H50.692zM15.77 10.846v49.692h27.292V48.615a1 1 0 011-1h11.554V10.846H15.77zm38.48 38.77h-9.188v9.458l9.189-9.459zM19.693 18.691a1 1 0 100 2h32a1 1 0 100-2h-32zm-1 8.385a1 1 0 011-1h32a1 1 0 110 2h-32a1 1 0 01-1-1zm1 6.384a1 1 0 100 2h32a1 1 0 100-2h-32zm-1 8.385a1 1 0 011-1h32a1 1 0 010 2h-32a1 1 0 01-1-1zm1 6.385a1 1 0 100 2h17.231a1 1 0 000-2h-17.23z"
  }));
};

SvgDocumentation.propTypes = {
  title: propTypes.string
};
SvgDocumentation.defaultProps = {
  title: ''
};

var _excluded$n = ["title", "titleId"];

var SvgDownload = function SvgDownload(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$n);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M16.706 14.294a2.28 2.28 0 01-1.412-.486v1.17c.428.202.907.316 1.412.316.897 0 1.711-.359 2.305-.941h.048v-.048A3.283 3.283 0 0020 12c0-.898-.359-1.711-.941-2.305v-.048h-.048a3.301 3.301 0 00-.896-.625A5.177 5.177 0 007.958 7.77a3.765 3.765 0 10.748 7.406V14.13a2.765 2.765 0 11-.798-5.362 1 1 0 001.013-.727 4.177 4.177 0 018.195 1.01 1 1 0 00.571.874c.232.11.442.258.624.436l.017.016.017.018c.406.414.655.98.655 1.605s-.249 1.19-.655 1.605l-.017.018-.017.016c-.414.406-.98.655-1.605.655zm-5.086 6.031a.5.5 0 00.76 0l2-2.333a.5.5 0 00-.76-.65l-1.12 1.306V11a.5.5 0 00-1 0v7.648l-1.12-1.307a.5.5 0 10-.76.651l2 2.333z"
  }));
};

SvgDownload.propTypes = {
  title: propTypes.string
};
SvgDownload.defaultProps = {
  title: ''
};

var _excluded$o = ["title", "titleId"];

var SvgEdit = function SvgEdit(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$o);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M7.853 13.843l-.498 3.828 3.706-1.435L9.5 15l-1.647-1.157z"
  }), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M17.295 7.9c.178.562.131 1.192-.303 1.733l-5.541 6.916a.5.5 0 01-.21.153l-3.705 1.435a.5.5 0 01-.677-.53l.498-3.829a.5.5 0 01.106-.248l5.628-7.023c.434-.542 1.038-.724 1.625-.673.569.05 1.128.316 1.576.675.448.36.83.847 1.003 1.392zm-3.424-.768c.191-.239.446-.329.757-.302.33.03.707.193 1.039.46.332.266.575.599.674.913.095.298.062.566-.129.805l-5.23 6.527-1.172-.927a.52.52 0 00-.023-.017l-1.211-.851 5.295-6.608zm-5.629 7.595l.959.674.864.684-2.106.816.283-2.174z"
  }));
};

SvgEdit.propTypes = {
  title: propTypes.string
};
SvgEdit.defaultProps = {
  title: ''
};

var _excluded$p = ["title", "titleId"];

var SvgEth = function SvgEth(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$p);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M1 6V5h5v1H1zm-1 5v-1h7v1H0zM0 1V0h7v1H0z"
  }));
};

SvgEth.propTypes = {
  title: propTypes.string
};
SvgEth.defaultProps = {
  title: ''
};

var _excluded$q = ["title", "titleId"];

var SvgEtherscan = function SvgEtherscan(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$q);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M5 6.5A1.5 1.5 0 016.5 5H9a.5.5 0 010 1H6.5a.5.5 0 00-.5.5v2.25a.5.5 0 01-1 0V6.5zm9.5-1A.5.5 0 0115 5h2.5A1.5 1.5 0 0119 6.5v2.25a.5.5 0 01-1 0V6.5a.5.5 0 00-.5-.5H15a.5.5 0 01-.5-.5zM8.5 8a.5.5 0 01.5.5v7a.5.5 0 01-1 0v-7a.5.5 0 01.5-.5zm2 0a.5.5 0 01.5.5v7a.5.5 0 01-1 0v-7a.5.5 0 01.5-.5zM12 9a1 1 0 112 0v6a1 1 0 11-2 0V9zm3.5-1a.5.5 0 01.5.5v7a.5.5 0 01-1 0v-7a.5.5 0 01.5-.5zm-10 6.75a.5.5 0 01.5.5v2.25a.5.5 0 00.5.5H9a.5.5 0 010 1H6.5A1.5 1.5 0 015 17.5v-2.25a.5.5 0 01.5-.5zm13 0a.5.5 0 01.5.5v2.25a1.5 1.5 0 01-1.5 1.5H15a.5.5 0 010-1h2.5a.5.5 0 00.5-.5v-2.25a.5.5 0 01.5-.5z"
  }));
};

SvgEtherscan.propTypes = {
  title: propTypes.string
};
SvgEtherscan.defaultProps = {
  title: ''
};

var _excluded$r = ["title", "titleId"];

var SvgEthSub = function SvgEthSub(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$r);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M1 6V5h5v1H1zm-1 5v-1h7v1H0zM0 1V0h7v1H0z"
  }));
};

SvgEthSub.propTypes = {
  title: propTypes.string
};
SvgEthSub.defaultProps = {
  title: ''
};

var _excluded$s = ["title", "titleId"];

var SvgExport = function SvgExport(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$s);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M11.62 13.825a.5.5 0 00.76 0l2-2.333a.5.5 0 00-.76-.65l-1.12 1.306V4.5a.5.5 0 00-1 0v7.648l-1.12-1.307a.5.5 0 10-.76.651l2 2.333zM7 14a.5.5 0 00-1 0v4.5a.5.5 0 00.5.5h11a.5.5 0 00.5-.5V14a.5.5 0 00-1 0v4H7v-4z"
  }));
};

SvgExport.propTypes = {
  title: propTypes.string
};
SvgExport.defaultProps = {
  title: ''
};

var _excluded$t = ["title", "titleId"];

var SvgFirebase = function SvgFirebase(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$t);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "23 4 97 136",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fill: "#aaa",
    d: "M23.833 111.719L39.966 8.49a2.98 2.98 0 015.57-.946L62.22 38.662 68.87 26a2.98 2.98 0 015.273 0l45.023 85.719H23.833z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#929292",
    d: "M79.566 71.507l-17.354-32.86-38.379 73.072 55.733-40.212z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#C8C8C8",
    d: "M119.167 111.719l-12.356-76.46c-.187-1.099-.97-2-2.032-2.34s-2.222-.058-3.01.73l-77.936 78.069L66.957 135.9a8.937 8.937 0 008.714 0l43.496-24.183z"
  }));
};

SvgFirebase.propTypes = {
  title: propTypes.string
};
SvgFirebase.defaultProps = {
  title: ''
};

var _excluded$u = ["title", "titleId"];

var SvgGithub = function SvgGithub(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$u);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M9.021 21.829c.007 1.065.017 2.171.017 2.171h6.136c0-.419.016-1.795.016-3.502 0-1.191-.397-1.97-.84-2.364 2.756-.316 5.65-1.396 5.65-6.3 0-1.394-.479-2.533-1.272-3.426.127-.323.552-1.62-.123-3.378 0 0-1.038-.344-3.4 1.308a11.554 11.554 0 00-3.099-.43c-1.053.006-2.11.147-3.098.43C6.644 4.686 5.604 5.03 5.604 5.03c-.673 1.757-.248 3.055-.12 3.378-.793.893-1.275 2.032-1.275 3.426 0 4.892 2.89 5.987 5.638 6.31-.354.319-.674.881-.786 1.706-.706.327-2.498.89-3.602-1.06 0 0-.654-1.226-1.896-1.316 0 0-1.209-.016-.085.776 0 0 .812.393 1.374 1.867 0 0 .726 2.483 4.17 1.712z"
  }));
};

SvgGithub.propTypes = {
  title: propTypes.string
};
SvgGithub.defaultProps = {
  title: ''
};

var _excluded$v = ["title", "titleId"];

var SvgHeart = function SvgHeart(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$v);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M22.15 2.945a6.303 6.303 0 00-2.05-1.44A6.05 6.05 0 0017.683 1a6.05 6.05 0 00-2.417.505 6.304 6.304 0 00-2.05 1.44l-.854.898a.5.5 0 01-.725 0l-.854-.898C9.598 1.7 7.992 1.001 6.316 1.001 4.641 1 3.035 1.7 1.85 2.945S0 5.878 0 7.639c0 1.76.665 3.449 1.85 4.694l1.217 1.279 8.57 9.007a.5.5 0 00.725 0l8.57-9.007 1.217-1.28a6.667 6.667 0 001.37-2.153A6.93 6.93 0 0024 7.64a6.93 6.93 0 00-.481-2.54 6.668 6.668 0 00-1.37-2.154z"
  }));
};

SvgHeart.propTypes = {
  title: propTypes.string
};
SvgHeart.defaultProps = {
  title: ''
};

var _excluded$w = ["title", "titleId"];

var SvgHome = function SvgHome(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$w);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M12.5 5.5c-.195-.192-.805-.192-1 0l-6.351 6.567a.5.5 0 00.351.856h1.214V17.5a.5.5 0 00.5.5h2.572a.5.5 0 00.5-.5v-2.885h3.428V17.5a.5.5 0 00.5.5h2.572a.5.5 0 00.5-.5v-4.577H18.5a.5.5 0 00.351-.856L12.5 5.5z"
  }));
};

SvgHome.propTypes = {
  title: propTypes.string
};
SvgHome.defaultProps = {
  title: ''
};

var _excluded$x = ["title", "titleId"];

var SvgIdea = function SvgIdea(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$x);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "-14 -4 130 130",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M7.806 48.14H2.602A2.61 2.61 0 000 50.742a2.61 2.61 0 002.602 2.602h5.204a2.61 2.61 0 002.603-2.602 2.61 2.61 0 00-2.603-2.602zM98.882 48.14h-5.205a2.61 2.61 0 00-2.602 2.602 2.61 2.61 0 002.602 2.602h5.205a2.61 2.61 0 002.602-2.602 2.61 2.61 0 00-2.602-2.602zM48.14 2.602v5.204a2.61 2.61 0 002.602 2.603 2.61 2.61 0 002.602-2.603V2.602A2.61 2.61 0 0050.742 0a2.61 2.61 0 00-2.602 2.602zM18.605 22.248c.52.52 1.171.781 1.822.781.65 0 1.3-.26 1.821-.78 1.041-1.041 1.041-2.603 0-3.644l-4.814-4.814c-1.04-1.04-2.602-1.04-3.643 0-1.04 1.041-1.04 2.602 0 3.643l4.814 4.814zM82.878 79.236c-1.041-1.041-2.602-1.041-3.643 0-1.041 1.04-1.041 2.602 0 3.642l4.814 4.814c.52.52 1.17.781 1.821.781.65 0 1.301-.26 1.822-.78 1.04-1.041 1.04-2.603 0-3.644l-4.814-4.814zM84.049 13.791l-4.814 4.814c-1.041 1.041-1.041 2.602 0 3.643.52.52 1.17.781 1.821.781.65 0 1.301-.26 1.822-.78l4.814-4.815c1.04-1.04 1.04-2.602 0-3.643-1.041-1.04-2.602-1.04-3.643 0zM18.605 79.236l-4.814 4.813c-1.04 1.041-1.04 2.603 0 3.643.52.52 1.171.781 1.822.781.65 0 1.301-.26 1.821-.78l4.814-4.814c1.041-1.041 1.041-2.603 0-3.644-1.04-1.04-2.732-1.04-3.643 0zM48.66 17.044C32.006 18.084 18.475 31.746 17.694 48.4c-.52 10.279 3.513 19.516 10.409 25.891 3.643 3.513 5.855 8.197 5.855 13.271v4.814h33.828v-4.814c0-4.944 1.951-9.628 5.594-13.01 6.636-6.116 10.67-14.703 10.67-24.46-.13-18.996-16.134-34.349-35.39-33.048zM67.656 97.58H33.828v5.205h33.828v-5.204zM67.656 106.688H33.828v5.204h33.828v-5.204zM62.452 115.796h-23.42V121h23.42v-5.204z"
  }));
};

SvgIdea.propTypes = {
  title: propTypes.string
};
SvgIdea.defaultProps = {
  title: ''
};

var _excluded$y = ["title", "titleId"];

var SvgInfo = function SvgInfo(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$y);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 16 17",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M8 6.1a.8.8 0 100-1.6.8.8 0 000 1.6zm0 6.4a.667.667 0 00.667-.667v-4a.667.667 0 00-1.333 0v4c0 .368.298.667.666.667z"
  }));
};

SvgInfo.propTypes = {
  title: propTypes.string
};
SvgInfo.defaultProps = {
  title: ''
};

var _excluded$z = ["title", "titleId"];

var SvgJobs = function SvgJobs(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$z);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M13 5h-2a2 2 0 00-2 2H7a2 2 0 00-2 2v1h14V9a2 2 0 00-2-2h-2a2 2 0 00-2-2zm1 2a1 1 0 00-1-1h-2a1 1 0 00-1 1h4zm-9 4h14v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z"
  }));
};

SvgJobs.propTypes = {
  title: propTypes.string
};
SvgJobs.defaultProps = {
  title: ''
};

var _excluded$A = ["title", "titleId"];

var SvgKey = function SvgKey(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$A);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M6.424 12.89a3.417 3.417 0 012.525-.995c.849.028 1.77-.067 2.37-.668l4.803-4.803a1.143 1.143 0 011.616 1.617l-4.803 4.803c-.6.6-.695 1.52-.667 2.37a3.416 3.416 0 01-3.42 3.528 3.428 3.428 0 01-2.424-5.853zm3.233 3.232a1.145 1.145 0 000-1.616 1.145 1.145 0 00-1.616 0 1.145 1.145 0 000 1.616 1.145 1.145 0 001.616 0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12.89 9.657a1.143 1.143 0 011.616 0l1.616 1.616a1.143 1.143 0 11-1.616 1.616l-1.617-1.616a1.143 1.143 0 010-1.616zM15.357 7.189a1.143 1.143 0 011.617 0l1.616 1.616a1.143 1.143 0 01-1.616 1.616l-1.617-1.616a1.143 1.143 0 010-1.616z"
  }));
};

SvgKey.propTypes = {
  title: propTypes.string
};
SvgKey.defaultProps = {
  title: ''
};

var _excluded$B = ["title", "titleId"];

var SvgLemniscate = function SvgLemniscate(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$B);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M4.856 10.192c-1.13 0-2.016-.379-2.656-1.136-.629-.757-.944-1.819-.944-3.184 0-1.365.315-2.427.944-3.184.64-.757 1.526-1.136 2.656-1.136 1.131 0 2.011.379 2.64 1.136.64.757.96 1.819.96 3.184 0 1.365-.32 2.427-.96 3.184-.629.757-1.509 1.136-2.64 1.136zm0-.8c.811 0 1.451-.256 1.92-.768.47-.512.704-1.259.704-2.24V5.36c0-.981-.234-1.728-.704-2.24-.469-.512-1.109-.768-1.92-.768-.81 0-1.45.256-1.92.768-.469.512-.704 1.259-.704 2.24v1.024c0 .981.235 1.728.704 2.24.47.512 1.11.768 1.92.768z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11.25 10.192c-1.13 0-2.016-.379-2.656-1.136-.63-.757-.944-1.819-.944-3.184 0-1.365.315-2.427.944-3.184.64-.757 1.526-1.136 2.656-1.136 1.13 0 2.01.379 2.64 1.136.64.757.96 1.819.96 3.184 0 1.365-.32 2.427-.96 3.184-.63.757-1.51 1.136-2.64 1.136zm0-.8c.81 0 1.45-.256 1.92-.768s.704-1.259.704-2.24V5.36c0-.981-.235-1.728-.704-2.24-.47-.512-1.11-.768-1.92-.768-.81 0-1.45.256-1.92.768s-.704 1.259-.704 2.24v1.024c0 .981.235 1.728.704 2.24.47.512 1.11.768 1.92.768z"
  }));
};

SvgLemniscate.propTypes = {
  title: propTypes.string
};
SvgLemniscate.defaultProps = {
  title: ''
};

var _excluded$C = ["title", "titleId"];

var SvgLiveDemo = function SvgLiveDemo(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$C);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 64 64",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("mask", {
    id: "live-demo_svg__a",
    fill: "#fff"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M10.846 7.385a1 1 0 00-1 1v17.487a1 1 0 001 1h17.487a1 1 0 001-1V8.385a1 1 0 00-1-1H10.846zm0 27.282a1 1 0 00-1 1v17.487a1 1 0 001 1h17.487a1 1 0 001-1V35.667a1 1 0 00-1-1H10.846zM37.128 8.385a1 1 0 011-1h17.487a1 1 0 011 1v17.487a1 1 0 01-1 1H38.128a1 1 0 01-1-1V8.385zm1 26.282a1 1 0 00-1 1v17.487a1 1 0 001 1h17.487a1 1 0 001-1V35.667a1 1 0 00-1-1H38.128z"
  })), /*#__PURE__*/React.createElement("path", {
    d: "M11.846 8.385a1 1 0 01-1 1v-4a3 3 0 00-3 3h4zm0 17.487V8.385h-4v17.487h4zm-1-1a1 1 0 011 1h-4a3 3 0 003 3v-4zm17.487 0H10.846v4h17.487v-4zm-1 1a1 1 0 011-1v4a3 3 0 003-3h-4zm0-17.487v17.487h4V8.385h-4zm1 1a1 1 0 01-1-1h4a3 3 0 00-3-3v4zm-17.487 0h17.487v-4H10.846v4zm1 26.282a1 1 0 01-1 1v-4a3 3 0 00-3 3h4zm0 17.487V35.667h-4v17.487h4zm-1-1a1 1 0 011 1h-4a3 3 0 003 3v-4zm17.487 0H10.846v4h17.487v-4zm-1 1a1 1 0 011-1v4a3 3 0 003-3h-4zm0-17.487v17.487h4V35.667h-4zm1 1a1 1 0 01-1-1h4a3 3 0 00-3-3v4zm-17.487 0h17.487v-4H10.846v4zM38.128 5.385a3 3 0 00-3 3h4a1 1 0 01-1 1v-4zm17.487 0H38.128v4h17.487v-4zm3 3a3 3 0 00-3-3v4a1 1 0 01-1-1h4zm0 17.487V8.385h-4v17.487h4zm-3 3a3 3 0 003-3h-4a1 1 0 011-1v4zm-17.487 0h17.487v-4H38.128v4zm-3-3a3 3 0 003 3v-4a1 1 0 011 1h-4zm0-17.487v17.487h4V8.385h-4zm4 27.282a1 1 0 01-1 1v-4a3 3 0 00-3 3h4zm0 17.487V35.667h-4v17.487h4zm-1-1a1 1 0 011 1h-4a3 3 0 003 3v-4zm17.487 0H38.128v4h17.487v-4zm-1 1a1 1 0 011-1v4a3 3 0 003-3h-4zm0-17.487v17.487h4V35.667h-4zm1 1a1 1 0 01-1-1h4a3 3 0 00-3-3v4zm-17.487 0h17.487v-4H38.128v4z",
    mask: "url(#live-demo_svg__a)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M30.618 34.281l7.514-.009c1.356-.002 2.014-1.658 1.03-2.59l-20.4-19.302c-.957-.905-2.531-.227-2.531 1.09v27.554c0 1.321 1.584 1.997 2.538 1.083l5.498-5.274 4.342 9.896a1.5 1.5 0 001.927.791l3.554-1.41a1.5 1.5 0 00.821-1.995l-4.293-9.834z",
    stroke: "#fff",
    strokeWidth: 2
  }));
};

SvgLiveDemo.propTypes = {
  title: propTypes.string
};
SvgLiveDemo.defaultProps = {
  title: ''
};

var _excluded$D = ["title", "titleId"];

var SvgLoading = function SvgLoading(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$D);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("circle", {
    cx: 16,
    cy: 3,
    r: 0
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "r",
    values: "0;3;0;0",
    dur: "1s",
    repeatCount: "indefinite",
    begin: 0,
    keySplines: "0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8",
    calcMode: "spline"
  })), /*#__PURE__*/React.createElement("circle", {
    transform: "rotate(45 16 16)",
    cx: 16,
    cy: 3,
    r: 0
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "r",
    values: "0;3;0;0",
    dur: "1s",
    repeatCount: "indefinite",
    begin: "0.125s",
    keySplines: "0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8",
    calcMode: "spline"
  })), /*#__PURE__*/React.createElement("circle", {
    transform: "rotate(90 16 16)",
    cx: 16,
    cy: 3,
    r: 0
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "r",
    values: "0;3;0;0",
    dur: "1s",
    repeatCount: "indefinite",
    begin: "0.25s",
    keySplines: "0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8",
    calcMode: "spline"
  })), /*#__PURE__*/React.createElement("circle", {
    transform: "rotate(135 16 16)",
    cx: 16,
    cy: 3,
    r: 0
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "r",
    values: "0;3;0;0",
    dur: "1s",
    repeatCount: "indefinite",
    begin: "0.375s",
    keySplines: "0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8",
    calcMode: "spline"
  })), /*#__PURE__*/React.createElement("circle", {
    transform: "rotate(180 16 16)",
    cx: 16,
    cy: 3,
    r: 0
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "r",
    values: "0;3;0;0",
    dur: "1s",
    repeatCount: "indefinite",
    begin: "0.5s",
    keySplines: "0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8",
    calcMode: "spline"
  })), /*#__PURE__*/React.createElement("circle", {
    transform: "rotate(225 16 16)",
    cx: 16,
    cy: 3,
    r: 0
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "r",
    values: "0;3;0;0",
    dur: "1s",
    repeatCount: "indefinite",
    begin: "0.625s",
    keySplines: "0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8",
    calcMode: "spline"
  })), /*#__PURE__*/React.createElement("circle", {
    transform: "rotate(270 16 16)",
    cx: 16,
    cy: 3,
    r: 0
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "r",
    values: "0;3;0;0",
    dur: "1s",
    repeatCount: "indefinite",
    begin: "0.75s",
    keySplines: "0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8",
    calcMode: "spline"
  })), /*#__PURE__*/React.createElement("circle", {
    transform: "rotate(315 16 16)",
    cx: 16,
    cy: 3,
    r: 0
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "r",
    values: "0;3;0;0",
    dur: "1s",
    repeatCount: "indefinite",
    begin: "0.875s",
    keySplines: "0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8",
    calcMode: "spline"
  })), /*#__PURE__*/React.createElement("circle", {
    transform: "rotate(180 16 16)",
    cx: 16,
    cy: 3,
    r: 0
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "r",
    values: "0;3;0;0",
    dur: "1s",
    repeatCount: "indefinite",
    begin: "0.5s",
    keySplines: "0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8",
    calcMode: "spline"
  })));
};

SvgLoading.propTypes = {
  title: propTypes.string
};
SvgLoading.defaultProps = {
  title: ''
};

var _excluded$E = ["title", "titleId"];

var SvgLoadingDots = function SvgLoadingDots(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$E);

  return /*#__PURE__*/React.createElement("svg", _extends({
    id: "loadingDots_svg__ep1opzeolwb1",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 32 32",
    shapeRendering: "geometricPrecision",
    textRendering: "geometricPrecision",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("style", null, '@keyframes ep1opzeolwb3_f_o{0%,to{fill-opacity:0}29.411765%{fill-opacity:0;animation-timing-function:cubic-bezier(.42,0,1,1)}52.941176%,76.470588%{fill-opacity:1;animation-timing-function:cubic-bezier(.42,0,1,1)}}@keyframes ep1opzeolwb4_f_o{0%,82.352941%,to{fill-opacity:0}11.764706%{fill-opacity:0;animation-timing-function:cubic-bezier(.42,0,1,1)}35.294118%,58.823529%{fill-opacity:1;animation-timing-function:cubic-bezier(.42,0,1,1)}}@keyframes ep1opzeolwb5_f_o{0%{fill-opacity:0;animation-timing-function:cubic-bezier(.42,0,1,1)}23.529412%,47.058824%{fill-opacity:1;animation-timing-function:cubic-bezier(.42,0,1,1)}70.588235%,to{fill-opacity:0}}'), /*#__PURE__*/React.createElement("path", {
    id: "loadingDots_svg__ep1opzeolwb2",
    d: "M16 32c8.837 0 16-7.163 16-16S24.837 0 16 0 0 7.163 0 16s7.163 16 16 16z",
    clipRule: "evenodd",
    fill: "#4D8BE8",
    fillRule: "evenodd",
    stroke: "none",
    strokeWidth: 1
  }), /*#__PURE__*/React.createElement("circle", {
    transform: "translate(23.068 16)",
    fill: "#FFF",
    fillOpacity: 0,
    style: {
      animation: 'ep1opzeolwb3_f_o 1700ms linear infinite normal forwards'
    },
    r: 2.333
  }), /*#__PURE__*/React.createElement("circle", {
    r: 2.333,
    transform: "translate(16 16)",
    fill: "#FFF",
    fillOpacity: 0,
    style: {
      animation: 'ep1opzeolwb4_f_o 1700ms linear infinite normal forwards'
    }
  }), /*#__PURE__*/React.createElement("circle", {
    transform: "translate(9 16)",
    fill: "#FFF",
    fillOpacity: 0,
    style: {
      animation: 'ep1opzeolwb5_f_o 1700ms linear infinite normal forwards'
    },
    r: 2.333
  }));
};

SvgLoadingDots.propTypes = {
  title: propTypes.string
};
SvgLoadingDots.defaultProps = {
  title: ''
};

var _excluded$F = ["title", "titleId"];

var SvgLock = function SvgLock(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$F);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "-15 -4 120 120",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M84.676 47.24h-7.912V31.65C76.764 14.172 62.592 0 45.114 0c-17.479 0-31.65 14.172-31.65 31.65v15.59H5.55C2.48 47.24 0 49.72 0 52.79v53.734a5.544 5.544 0 005.55 5.551h79.126c3.07 0 5.551-2.48 5.551-5.551V52.79c0-3.07-2.48-5.55-5.55-5.55zM51.963 91.998c.473 1.771-.945 3.542-2.716 3.542H40.98c-1.89 0-3.189-1.771-2.716-3.542l2.598-10.039c-3.07-1.535-5.196-4.724-5.196-8.503a9.526 9.526 0 019.566-9.566 9.526 9.526 0 019.566 9.566c0 3.78-2.126 6.968-5.197 8.503L51.963 92zm8.976-44.76h-31.65V31.65c0-8.739 7.085-15.825 15.825-15.825 8.739 0 15.825 7.086 15.825 15.825v15.59z"
  }));
};

SvgLock.propTypes = {
  title: propTypes.string
};
SvgLock.defaultProps = {
  title: ''
};

var _excluded$G = ["title", "titleId"];

var SvgLockClosed = function SvgLockClosed(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$G);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M9.5 7.667C9.5 6.524 10.562 5.5 12 5.5s2.5 1.024 2.5 2.167V9h-5V7.667zM8.5 9H7a1 1 0 00-1 1v8a1 1 0 001 1h10a1 1 0 001-1v-8a1 1 0 00-1-1h-1.5V7.667C15.5 5.864 13.876 4.5 12 4.5S8.5 5.864 8.5 7.667V9zM7 18h10v-8H7v8zm3-4c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z"
  }));
};

SvgLockClosed.propTypes = {
  title: propTypes.string
};
SvgLockClosed.defaultProps = {
  title: ''
};

var _excluded$H = ["title", "titleId"];

var SvgLog = function SvgLog(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$H);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M10.5 8a.5.5 0 010-1h6a.5.5 0 010 1h-6zm6.5 2.5a.5.5 0 01-.5.5h-6a.5.5 0 010-1h6a.5.5 0 01.5.5zm-7 3a.5.5 0 00.5.5h6a.5.5 0 000-1h-6a.5.5 0 00-.5.5zm7 3a.5.5 0 01-.5.5h-6a.5.5 0 010-1h6a.5.5 0 01.5.5zm-10-6a.5.5 0 00.5.5h1a.5.5 0 000-1h-1a.5.5 0 00-.5.5zM7.5 8a.5.5 0 010-1h1a.5.5 0 010 1h-1zM7 13.5a.5.5 0 00.5.5h1a.5.5 0 000-1h-1a.5.5 0 00-.5.5zm2 3a.5.5 0 01-.5.5h-1a.5.5 0 010-1h1a.5.5 0 01.5.5z"
  }));
};

SvgLog.propTypes = {
  title: propTypes.string
};
SvgLog.defaultProps = {
  title: ''
};

var _excluded$I = ["title", "titleId"];

var SvgMembers = function SvgMembers(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$I);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M9.613 0c1.938 0 3.546 1.553 3.546 3.5 0 1.196-.61 2.245-1.524 2.873a5.565 5.565 0 013.2 3.184c.248.644.09 1.29-.284 1.745-.36.438-.914.698-1.503.698h-1.136a2.735 2.735 0 00-.177-.79 6.427 6.427 0 00-.085-.21h1.398c.596 0 1.068-.527.854-1.085a4.57 4.57 0 00-2.93-2.713c-.344-.105-.609-.407-.609-.768 0-.323.219-.6.502-.758A2.496 2.496 0 0012.159 3.5c0-1.378-1.143-2.5-2.546-2.5-.655 0-1.254.245-1.706.647a4.6 4.6 0 00-.975-.435A3.565 3.565 0 019.613 0zm-.527 5.5C9.086 3.553 7.48 2 5.541 2S1.995 3.553 1.995 5.5c0 1.196.608 2.244 1.524 2.873a5.565 5.565 0 00-3.2 3.184c-.248.643-.09 1.29.284 1.745.36.438.913.698 1.503.698h6.869c.59 0 1.143-.26 1.503-.698a1.738 1.738 0 00.285-1.745 5.565 5.565 0 00-3.2-3.184A3.486 3.486 0 009.086 5.5zm-1 0c0-1.378-1.143-2.5-2.545-2.5-1.403 0-2.546 1.122-2.546 2.5 0 1.12.754 2.07 1.79 2.387.27.083.488.315.488.598 0 .293-.23.532-.52.581a4.578 4.578 0 00-3.5 2.85c-.215.556.257 1.084.853 1.084h6.869c.597 0 1.068-.527.854-1.085A4.57 4.57 0 006.9 9.202c-.344-.105-.608-.407-.608-.768 0-.323.218-.6.5-.758A2.496 2.496 0 008.087 5.5z"
  }));
};

SvgMembers.propTypes = {
  title: propTypes.string
};
SvgMembers.defaultProps = {
  title: ''
};

var _excluded$J = ["title", "titleId"];

var SvgMetamask = function SvgMetamask(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$J);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 122 113",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M115.024 1L68.2 35.776 76.86 15.26 115.024 1z",
    fill: "#E2761B",
    stroke: "#E2761B",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.93 1l46.446 35.106-8.235-20.847L6.929 1zM98.176 81.612l-12.47 19.106 26.682 7.341 7.671-26.024-21.883-.423zM1.988 82.035l7.624 26.024 26.682-7.341-12.47-19.106-21.836.423z",
    fill: "#E4761B",
    stroke: "#E4761B",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M34.788 49.33l-7.435 11.247 26.494 1.176-.941-28.47-18.118 16.046zM87.165 49.33L68.811 32.953l-.612 28.8 26.447-1.176-7.483-11.247zM36.294 100.718L52.2 92.953l-13.742-10.73-2.164 18.495zM69.753 92.953l15.953 7.765-2.212-18.495-13.741 10.73z",
    fill: "#E4761B",
    stroke: "#E4761B",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M85.706 100.718l-15.953-7.765 1.27 10.4-.14 4.376 14.823-7.011zM36.294 100.718l14.824 7.011-.095-4.376 1.177-10.4-15.906 7.765z",
    fill: "#D7C1B3",
    stroke: "#D7C1B3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M51.353 75.353l-13.27-3.906 9.364-4.282 3.906 8.188zM70.6 75.353l3.906-8.188 9.412 4.282L70.6 75.353z",
    fill: "#233447",
    stroke: "#233447",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M36.294 100.718l2.259-19.106-14.73.423 12.471 18.683zM83.447 81.612l2.259 19.106 12.47-18.683-14.729-.423zM94.647 60.576L68.2 61.753l2.447 13.6 3.906-8.188 9.412 4.282 10.682-10.87zM38.082 71.447l9.412-4.282 3.859 8.188 2.494-13.6-26.494-1.177 10.73 10.871z",
    fill: "#CD6116",
    stroke: "#CD6116",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M27.353 60.576l11.106 21.648-.377-10.777-10.73-10.87zM83.965 71.447l-.471 10.776 11.153-21.647-10.682 10.871zM53.847 61.753l-2.494 13.6L54.459 91.4l.705-21.13-1.317-8.517zM68.2 61.753l-1.27 8.47.564 21.177 3.153-16.047-2.447-13.6z",
    fill: "#E4751F",
    stroke: "#E4751F",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M70.647 75.353L67.494 91.4l2.259 1.553 13.741-10.73.47-10.776-13.317 3.906zM38.082 71.447l.377 10.776L52.2 92.954l2.259-1.553-3.106-16.047-13.27-3.906z",
    fill: "#F6851B",
    stroke: "#F6851B",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M70.882 107.729l.141-4.376-1.176-1.035H52.106l-1.083 1.035.095 4.376-14.824-7.011 5.177 4.235 10.494 7.294h18.023l10.541-7.294 5.177-4.235-14.824 7.011z",
    fill: "#C0AD9E",
    stroke: "#C0AD9E",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M69.753 92.953L67.494 91.4H54.46L52.2 92.953l-1.176 10.4 1.082-1.035h17.741l1.177 1.035-1.271-10.4z",
    fill: "#161616",
    stroke: "#161616",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M117 38.035l4-19.2L115.024 1 69.753 34.6l17.412 14.73 24.611 7.2 5.459-6.354-2.353-1.694 3.765-3.435-2.918-2.259 3.765-2.87L117 38.035zM1 18.835l4 19.2-2.541 1.883 3.765 2.87-2.871 2.26 3.765 3.434-2.353 1.694 5.412 6.353 24.611-7.2L52.2 34.6 6.93 1 1 18.835z",
    fill: "#763D16",
    stroke: "#763D16",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M111.777 56.53l-24.612-7.2 7.482 11.246-11.153 21.648 14.683-.189h21.882l-8.282-25.506zM34.788 49.33l-24.612 7.2-8.188 25.505h21.835l14.636.189-11.106-21.648 7.435-11.247zM68.2 61.753L69.753 34.6l7.153-19.341H45.14l7.06 19.341 1.646 27.153.565 8.565.047 21.082h13.035l.094-21.082.612-8.565z",
    fill: "#F6851B",
    stroke: "#F6851B",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
};

SvgMetamask.propTypes = {
  title: propTypes.string
};
SvgMetamask.defaultProps = {
  title: ''
};

var _excluded$K = ["title", "titleId"];

var SvgEmail = function SvgEmail(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$K);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M5.044 7.705A1 1 0 005 8v7a2 2 0 002 2h10a2 2 0 002-2V8a.998.998 0 00-.044-.295.497.497 0 01-.171.206l-5.931 4.106a1.5 1.5 0 01-1.708 0l-5.93-4.106a.498.498 0 01-.172-.206zm13.25-.66A1 1 0 0018 7H6a1 1 0 00-.295.044.503.503 0 01.08.045l5.93 4.106a.5.5 0 00.57 0l5.93-4.106a.502.502 0 01.08-.045z"
  }));
};

SvgEmail.propTypes = {
  title: propTypes.string
};
SvgEmail.defaultProps = {
  title: ''
};

var _excluded$L = ["title", "titleId"];

var SvgOpera = function SvgOpera(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$L);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 120 120",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("mask", {
    id: "opera_svg__a",
    maskUnits: "userSpaceOnUse",
    x: 0,
    y: 0,
    width: 100,
    height: 120
  }, /*#__PURE__*/React.createElement("path", {
    d: "M59.634 0C26.698 0 0 26.698 0 59.637c0 31.982 25.176 58.079 56.79 59.562.946.046 1.892.07 2.842.07 15.268 0 29.193-5.739 39.741-15.174-6.988 4.636-15.16 7.304-23.895 7.304-14.199 0-26.92-7.047-35.472-18.156-6.592-7.783-10.866-19.291-11.158-32.204v-2.81c.292-12.913 4.565-24.42 11.157-32.202 8.552-11.105 21.273-18.15 35.471-18.15 8.735 0 16.913 2.667 23.902 7.302C88.883 5.792 75.04.059 59.86.006c-.078 0-.152-.006-.229-.006h.002z",
    fill: "#fff"
  })), /*#__PURE__*/React.createElement("g", {
    mask: "url(#opera_svg__a)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M99.379 0H0v119.268h99.378V0z",
    fill: "url(#opera_svg__paint0_linear)"
  })), /*#__PURE__*/React.createElement("mask", {
    id: "opera_svg__b",
    maskUnits: "userSpaceOnUse",
    x: 39,
    y: 7,
    width: 82,
    height: 106
  }, /*#__PURE__*/React.createElement("path", {
    d: "M39.293 7.473H120v104.621H39.293V7.473z",
    fill: "#fff"
  })), /*#__PURE__*/React.createElement("g", {
    mask: "url(#opera_svg__b)"
  }, /*#__PURE__*/React.createElement("mask", {
    id: "opera_svg__c",
    maskUnits: "userSpaceOnUse",
    x: 40,
    y: 7,
    width: 80,
    height: 105
  }, /*#__PURE__*/React.createElement("path", {
    d: "M40.006 26.027c5.47-6.457 12.54-10.352 20.257-10.352 17.363 0 31.434 19.68 31.434 43.962 0 24.276-14.071 43.955-31.434 43.955-7.718 0-14.787-3.893-20.257-10.35 8.551 11.11 21.272 18.157 35.47 18.157 8.735 0 16.907-2.668 23.896-7.304 12.208-10.923 19.897-26.79 19.897-44.458 0-17.666-7.689-33.54-19.891-44.458-6.987-4.635-15.166-7.303-23.9-7.303-14.2 0-26.92 7.046-35.472 18.15z",
    fill: "#fff"
  })), /*#__PURE__*/React.createElement("g", {
    mask: "url(#opera_svg__c)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M119.271 7.876H40.006V111.4h79.265V7.876z",
    fill: "url(#opera_svg__paint1_linear)"
  }))), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "opera_svg__paint0_linear",
    x1: 49.689,
    y1: 0,
    x2: 49.689,
    y2: 119.268,
    gradientUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: "#FF1B2D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.25,
    stopColor: "#FF1B2D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.313,
    stopColor: "#FF1B2D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.344,
    stopColor: "#FF1B2D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.375,
    stopColor: "#FE1B2D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.391,
    stopColor: "#FD1A2D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.406,
    stopColor: "#FD1A2C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.422,
    stopColor: "#FC1A2C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.438,
    stopColor: "#FB1A2C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.445,
    stopColor: "#FA1A2C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.453,
    stopColor: "#FA192C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.461,
    stopColor: "#F9192B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.469,
    stopColor: "#F9192B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.477,
    stopColor: "#F8192B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.484,
    stopColor: "#F8192B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.492,
    stopColor: "#F7192B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.5,
    stopColor: "#F6182B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.508,
    stopColor: "#F6182A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.516,
    stopColor: "#F5182A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.523,
    stopColor: "#F4182A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.531,
    stopColor: "#F4172A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.539,
    stopColor: "#F3172A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.547,
    stopColor: "#F21729"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.555,
    stopColor: "#F11729"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.563,
    stopColor: "#F01729"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.57,
    stopColor: "#F01629"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.578,
    stopColor: "#EF1628"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.586,
    stopColor: "#EE1628"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.594,
    stopColor: "#ED1528"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.602,
    stopColor: "#EC1528"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.609,
    stopColor: "#EB1527"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.617,
    stopColor: "#EA1527"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.625,
    stopColor: "#E91427"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.629,
    stopColor: "#E81427"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.633,
    stopColor: "#E81426"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.637,
    stopColor: "#E71426"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.641,
    stopColor: "#E71426"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.645,
    stopColor: "#E61326"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.648,
    stopColor: "#E61326"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.652,
    stopColor: "#E51326"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.656,
    stopColor: "#E51326"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.66,
    stopColor: "#E41325"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.664,
    stopColor: "#E41325"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.668,
    stopColor: "#E31225"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.672,
    stopColor: "#E21225"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.676,
    stopColor: "#E21225"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.68,
    stopColor: "#E11225"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.684,
    stopColor: "#E11224"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.688,
    stopColor: "#E01224"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.691,
    stopColor: "#E01124"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.695,
    stopColor: "#DF1124"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.699,
    stopColor: "#DE1124"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.703,
    stopColor: "#DE1124"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.707,
    stopColor: "#DD1123"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.711,
    stopColor: "#DD1023"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.715,
    stopColor: "#DC1023"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.719,
    stopColor: "#DB1023"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.723,
    stopColor: "#DB1023"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.727,
    stopColor: "#DA1023"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.73,
    stopColor: "#DA1022"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.734,
    stopColor: "#D90F22"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.738,
    stopColor: "#D80F22"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.742,
    stopColor: "#D80F22"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.746,
    stopColor: "#D70F22"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.75,
    stopColor: "#D60F21"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.754,
    stopColor: "#D60E21"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.758,
    stopColor: "#D50E21"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.762,
    stopColor: "#D40E21"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.766,
    stopColor: "#D40E21"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.77,
    stopColor: "#D30E21"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.773,
    stopColor: "#D20D20"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.777,
    stopColor: "#D20D20"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.781,
    stopColor: "#D10D20"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.785,
    stopColor: "#D00D20"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.789,
    stopColor: "#D00C20"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.793,
    stopColor: "#CF0C1F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.797,
    stopColor: "#CE0C1F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.801,
    stopColor: "#CE0C1F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.805,
    stopColor: "#CD0C1F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.809,
    stopColor: "#CC0B1F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.813,
    stopColor: "#CB0B1E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.816,
    stopColor: "#CB0B1E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.82,
    stopColor: "#CA0B1E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.824,
    stopColor: "#C90A1E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.828,
    stopColor: "#C80A1E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.832,
    stopColor: "#C80A1D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.836,
    stopColor: "#C70A1D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.84,
    stopColor: "#C60A1D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.844,
    stopColor: "#C5091D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.848,
    stopColor: "#C5091C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.852,
    stopColor: "#C4091C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.855,
    stopColor: "#C3091C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.859,
    stopColor: "#C2081C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.863,
    stopColor: "#C2081C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.867,
    stopColor: "#C1081B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.871,
    stopColor: "#C0081B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.875,
    stopColor: "#BF071B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.879,
    stopColor: "#BE071B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.883,
    stopColor: "#BE071A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.887,
    stopColor: "#BD071A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.891,
    stopColor: "#BC061A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.895,
    stopColor: "#BB061A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.898,
    stopColor: "#BA061A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.902,
    stopColor: "#BA0619"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.906,
    stopColor: "#B90519"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.91,
    stopColor: "#B80519"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.914,
    stopColor: "#B70519"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.918,
    stopColor: "#B60518"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.922,
    stopColor: "#B50418"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.926,
    stopColor: "#B50418"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.93,
    stopColor: "#B40418"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.934,
    stopColor: "#B30417"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.938,
    stopColor: "#B20317"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.941,
    stopColor: "#B10317"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.945,
    stopColor: "#B00317"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.949,
    stopColor: "#AF0316"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.953,
    stopColor: "#AE0216"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.957,
    stopColor: "#AE0216"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.961,
    stopColor: "#AD0216"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.965,
    stopColor: "#AC0115"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.969,
    stopColor: "#AB0115"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.973,
    stopColor: "#AA0115"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.977,
    stopColor: "#A90115"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.98,
    stopColor: "#A80014"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.984,
    stopColor: "#A70014"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 1,
    stopColor: "#A70014"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "opera_svg__paint1_linear",
    x1: 79.636,
    y1: 7.875,
    x2: 79.636,
    y2: 111.396,
    gradientUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: "#9C0000"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.008,
    stopColor: "#9C0000"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.012,
    stopColor: "#9D0000"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.016,
    stopColor: "#9D0101"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.02,
    stopColor: "#9E0101"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.023,
    stopColor: "#9E0202"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.027,
    stopColor: "#9F0202"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.031,
    stopColor: "#9F0202"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.035,
    stopColor: "#A00303"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.039,
    stopColor: "#A00303"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.043,
    stopColor: "#A10404"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.047,
    stopColor: "#A10404"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.051,
    stopColor: "#A20505"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.055,
    stopColor: "#A30505"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.059,
    stopColor: "#A30505"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.063,
    stopColor: "#A40606"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.066,
    stopColor: "#A40606"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.07,
    stopColor: "#A50707"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.074,
    stopColor: "#A50707"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.078,
    stopColor: "#A60808"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.082,
    stopColor: "#A70808"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.086,
    stopColor: "#A70808"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.09,
    stopColor: "#A80909"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.094,
    stopColor: "#A80909"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.098,
    stopColor: "#A90A0A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.102,
    stopColor: "#A90A0A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.105,
    stopColor: "#AA0B0B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.109,
    stopColor: "#AA0B0B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.113,
    stopColor: "#AB0B0B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.117,
    stopColor: "#AC0C0C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.121,
    stopColor: "#AC0C0C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.125,
    stopColor: "#AD0D0D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.129,
    stopColor: "#AD0D0D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.133,
    stopColor: "#AE0D0D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.137,
    stopColor: "#AE0E0E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.141,
    stopColor: "#AF0E0E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.145,
    stopColor: "#AF0F0F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.148,
    stopColor: "#B00F0F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.152,
    stopColor: "#B11010"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.156,
    stopColor: "#B11010"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.16,
    stopColor: "#B21010"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.164,
    stopColor: "#B21111"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.168,
    stopColor: "#B31111"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.172,
    stopColor: "#B31212"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.176,
    stopColor: "#B41212"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.18,
    stopColor: "#B51313"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.184,
    stopColor: "#B51313"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.188,
    stopColor: "#B61313"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.191,
    stopColor: "#B61414"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.195,
    stopColor: "#B71414"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.199,
    stopColor: "#B71515"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.203,
    stopColor: "#B81515"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.207,
    stopColor: "#B81616"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.211,
    stopColor: "#B91616"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.215,
    stopColor: "#BA1616"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.219,
    stopColor: "#BA1717"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.223,
    stopColor: "#BB1717"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.227,
    stopColor: "#BB1818"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.23,
    stopColor: "#BC1818"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.234,
    stopColor: "#BC1919"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.238,
    stopColor: "#BD1919"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.242,
    stopColor: "#BD1919"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.246,
    stopColor: "#BE1A1A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.25,
    stopColor: "#BF1A1A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.254,
    stopColor: "#BF1B1B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.258,
    stopColor: "#C01B1B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.262,
    stopColor: "#C01B1B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.266,
    stopColor: "#C11C1C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.27,
    stopColor: "#C11C1C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.273,
    stopColor: "#C21D1D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.277,
    stopColor: "#C21D1D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.281,
    stopColor: "#C31E1E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.285,
    stopColor: "#C41E1E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.289,
    stopColor: "#C41E1E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.293,
    stopColor: "#C51F1F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.297,
    stopColor: "#C51F1F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.301,
    stopColor: "#C62020"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.305,
    stopColor: "#C62020"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.309,
    stopColor: "#C72121"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.313,
    stopColor: "#C82121"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.316,
    stopColor: "#C82121"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.32,
    stopColor: "#C92222"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.324,
    stopColor: "#C92222"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.328,
    stopColor: "#CA2323"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.332,
    stopColor: "#CA2323"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.336,
    stopColor: "#CB2424"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.34,
    stopColor: "#CB2424"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.344,
    stopColor: "#CC2424"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.348,
    stopColor: "#CD2525"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.352,
    stopColor: "#CD2525"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.355,
    stopColor: "#CE2626"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.359,
    stopColor: "#CE2626"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.363,
    stopColor: "#CF2626"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.367,
    stopColor: "#CF2727"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.371,
    stopColor: "#D02727"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.375,
    stopColor: "#D02828"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.379,
    stopColor: "#D12828"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.383,
    stopColor: "#D22929"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.387,
    stopColor: "#D22929"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.391,
    stopColor: "#D32929"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.395,
    stopColor: "#D32A2A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.398,
    stopColor: "#D42A2A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.402,
    stopColor: "#D42B2B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.406,
    stopColor: "#D52B2B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.41,
    stopColor: "#D62C2C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.414,
    stopColor: "#D62C2C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.418,
    stopColor: "#D72C2C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.422,
    stopColor: "#D72D2D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.426,
    stopColor: "#D82D2D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.43,
    stopColor: "#D82E2E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.434,
    stopColor: "#D92E2E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.438,
    stopColor: "#D92F2F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.441,
    stopColor: "#DA2F2F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.445,
    stopColor: "#DB2F2F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.449,
    stopColor: "#DB3030"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.453,
    stopColor: "#DC3030"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.457,
    stopColor: "#DC3131"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.461,
    stopColor: "#DD3131"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.465,
    stopColor: "#DD3232"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.469,
    stopColor: "#DE3232"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.473,
    stopColor: "#DE3232"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.477,
    stopColor: "#DF3333"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.48,
    stopColor: "#E03333"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.484,
    stopColor: "#E03434"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.488,
    stopColor: "#E13434"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.492,
    stopColor: "#E13434"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.496,
    stopColor: "#E23535"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.5,
    stopColor: "#E23535"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.504,
    stopColor: "#E33636"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.508,
    stopColor: "#E43636"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.512,
    stopColor: "#E43737"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.516,
    stopColor: "#E53737"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.52,
    stopColor: "#E53737"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.523,
    stopColor: "#E63838"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.527,
    stopColor: "#E63838"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.531,
    stopColor: "#E73939"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.535,
    stopColor: "#E73939"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.539,
    stopColor: "#E83A3A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.543,
    stopColor: "#E93A3A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.547,
    stopColor: "#E93A3A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.551,
    stopColor: "#EA3B3B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.555,
    stopColor: "#EA3B3B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.559,
    stopColor: "#EB3C3C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.563,
    stopColor: "#EB3C3C"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.566,
    stopColor: "#EC3D3D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.57,
    stopColor: "#EC3D3D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.574,
    stopColor: "#ED3D3D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.578,
    stopColor: "#EE3E3E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.582,
    stopColor: "#EE3E3E"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.586,
    stopColor: "#EF3F3F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.59,
    stopColor: "#EF3F3F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.594,
    stopColor: "#F03F3F"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.598,
    stopColor: "#F04040"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.602,
    stopColor: "#F14040"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.605,
    stopColor: "#F14141"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.609,
    stopColor: "#F24141"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.613,
    stopColor: "#F34242"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.617,
    stopColor: "#F34242"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.621,
    stopColor: "#F44242"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.625,
    stopColor: "#F44343"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.629,
    stopColor: "#F54343"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.633,
    stopColor: "#F54444"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.637,
    stopColor: "#F64444"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.641,
    stopColor: "#F74545"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.645,
    stopColor: "#F74545"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.648,
    stopColor: "#F84545"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.652,
    stopColor: "#F84646"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.656,
    stopColor: "#F94646"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.66,
    stopColor: "#F94747"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.664,
    stopColor: "#FA4747"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.668,
    stopColor: "#FA4848"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.672,
    stopColor: "#FB4848"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.676,
    stopColor: "#FC4848"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.68,
    stopColor: "#FC4949"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.684,
    stopColor: "#FD4949"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.688,
    stopColor: "#FD4A4A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.691,
    stopColor: "#FE4A4A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.695,
    stopColor: "#FE4B4B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.703,
    stopColor: "#FF4B4B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.719,
    stopColor: "#FF4B4B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 0.75,
    stopColor: "#FF4B4B"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: 1,
    stopColor: "#FF4B4B"
  }))));
};

SvgOpera.propTypes = {
  title: propTypes.string
};
SvgOpera.defaultProps = {
  title: ''
};

var _excluded$M = ["title", "titleId"];

var SvgPerson = function SvgPerson(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$M);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M9.5.333c2.578 0 4.677 2.005 4.677 4.465 0 2.461-2.1 4.466-4.677 4.466-2.578 0-4.677-2.005-4.677-4.466 0-2.46 2.1-4.465 4.677-4.465zm0 21.334c-3.518 0-6.64-1.512-8.74-3.893-.395-.447-.539-1.089-.205-1.583 1.48-2.19 6.225-3.454 8.945-3.454 2.72 0 7.465 1.265 8.945 3.454.334.494.19 1.136-.204 1.583-2.1 2.38-5.223 3.893-8.741 3.893z"
  }));
};

SvgPerson.propTypes = {
  title: propTypes.string
};
SvgPerson.defaultProps = {
  title: ''
};

var _excluded$N = ["title", "titleId"];

var SvgPreview = function SvgPreview(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$N);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M13.91 12c0 1.036-.856 1.875-1.91 1.875-1.054 0-1.91-.84-1.91-1.875 0-1.036.856-1.875 1.91-1.875 1.054 0 1.91.84 1.91 1.875z"
  }), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M19.445 11.773L19 12l.445.227v.002l-.003.004-.006.013a3.808 3.808 0 01-.12.217 12.818 12.818 0 01-1.784 2.382C16.296 16.141 14.424 17.5 12 17.5s-4.296-1.36-5.532-2.655a12.827 12.827 0 01-1.784-2.382 7.57 7.57 0 01-.12-.217l-.006-.013-.002-.004-.001-.001L5 12l-.445-.227v-.002l.003-.004.006-.013a4.07 4.07 0 01.12-.217 12.827 12.827 0 011.784-2.382C7.704 7.859 9.576 6.5 12 6.5s4.296 1.36 5.532 2.655a12.818 12.818 0 011.784 2.382 7.78 7.78 0 01.12.217l.006.013.003.004v.002zm-13.56.734c-.135-.206-.24-.38-.314-.507a11.825 11.825 0 011.62-2.155C8.341 8.641 9.97 7.5 12 7.5s3.659 1.14 4.809 2.345A11.826 11.826 0 0118.429 12a11.829 11.829 0 01-1.62 2.155C15.659 15.36 14.03 16.5 12 16.5s-3.659-1.14-4.809-2.345a11.827 11.827 0 01-1.306-1.648z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 12l.445-.227a.501.501 0 010 .454L19 12zM4.555 11.773L5 12l-.445.228a.503.503 0 010-.455z"
  }));
};

SvgPreview.propTypes = {
  title: propTypes.string
};
SvgPreview.defaultProps = {
  title: ''
};

var _excluded$O = ["title", "titleId"];

var SvgQr = function SvgQr(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$O);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 60 60",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M16.364 10.91h-5.455v5.454h5.455v-5.455z"
  }), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M0 4a4 4 0 014-4h23.273v27.273H0V4zm5.455 1.455h16.363v16.363H5.455V5.455z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.91 43.636h5.454v5.455h-5.455v-5.455z"
  }), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M0 32.727h27.273V60H4a4 4 0 01-4-4V32.727zm5.455 5.455h16.363v16.363H5.455V38.182z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M43.636 10.91h5.455v5.454h-5.455v-5.455z"
  }), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M32.727 0v27.273H60V4a4 4 0 00-4-4H32.727zm21.819 5.455H38.181v16.363h16.363V5.455z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M49.09 32.727H32.728v5.455h10.91v5.454h5.454V32.727zM43.636 54.545V60H32.727v-5.455h10.91zM49.09 54.545h-5.454v-5.454h5.455v5.454zM49.09 54.545H60V56a4 4 0 01-4 4h-6.91v-5.455zM54.545 32.727H60v5.455h-5.455v-5.455zM54.545 43.636H60v5.455h-5.455v-5.455zM38.182 43.636h-5.455v5.455h5.455v-5.455z"
  }));
};

SvgQr.propTypes = {
  title: propTypes.string
};
SvgQr.defaultProps = {
  title: ''
};

var _excluded$P = ["title", "titleId"];

var SvgShopify = function SvgShopify(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$P);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 32 32",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M20.448 31.974l9.625-2.083s-3.474-23.484-3.5-23.641-.156-.255-.281-.255c-.13 0-2.573-.182-2.573-.182s-1.703-1.698-1.922-1.88a.415.415 0 00-.161-.099l-1.219 28.141zm-4.833-16.901s-1.083-.563-2.365-.563c-1.932 0-2.005 1.203-2.005 1.521 0 1.641 4.318 2.286 4.318 6.172 0 3.057-1.922 5.01-4.542 5.01-3.141 0-4.719-1.953-4.719-1.953l.859-2.781s1.661 1.422 3.042 1.422c.901 0 1.302-.724 1.302-1.245 0-2.156-3.542-2.255-3.542-5.807-.047-2.984 2.094-5.891 6.438-5.891 1.677 0 2.5.479 2.5.479l-1.26 3.625zm-.719-13.969c.177 0 .359.052.536.182-1.313.62-2.75 2.188-3.344 5.323a76.43 76.43 0 01-2.516.771c.688-2.38 2.359-6.26 5.323-6.26zm1.646 3.932v.182c-1.005.307-2.115.646-3.193.979.62-2.37 1.776-3.526 2.781-3.958.255.667.411 1.568.411 2.797zm.718-2.973c.922.094 1.521 1.151 1.901 2.339-.464.151-.979.307-1.542.484v-.333c0-1.005-.13-1.828-.359-2.495zm3.99 1.718c-.031 0-.083.026-.104.026-.026 0-.385.099-.953.281C19.63 2.442 18.625.927 16.849.927h-.156C16.183.281 15.558 0 15.021 0c-4.141 0-6.12 5.172-6.74 7.797-1.594.484-2.75.844-2.88.896-.901.286-.927.313-1.031 1.161-.099.615-2.438 18.75-2.438 18.75L20.01 32z"
  }));
};

SvgShopify.propTypes = {
  title: propTypes.string
};
SvgShopify.defaultProps = {
  title: ''
};

var _excluded$Q = ["title", "titleId"];

var SvgTelegram = function SvgTelegram(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$Q);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M16.801 5.065c.152.13.217.292.195.487L15.144 16.7a.482.482 0 01-.227.325.953.953 0 01-.228.033.613.613 0 01-.195-.033l-3.281-1.332-1.755 2.144a.433.433 0 01-.357.163.361.361 0 01-.163-.032.409.409 0 01-.227-.163c-.065-.087-.087-.173-.065-.26V15.01l6.27-7.702-7.764 6.727-2.86-1.17c-.173-.065-.27-.206-.292-.422 0-.174.076-.315.227-.423l12.087-6.955A.4.4 0 0116.54 5c.087 0 .173.022.26.065z"
  }));
};

SvgTelegram.propTypes = {
  title: propTypes.string
};
SvgTelegram.defaultProps = {
  title: ''
};

var _excluded$R = ["title", "titleId"];

var SvgTicket = function SvgTicket(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$R);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M23 19.853h-.733c-.406 0-.734.355-.734.794 0 .44.328.794.734.794H23v3.383c0 .876-.657 1.588-1.467 1.588H2.467C1.657 26.412 1 25.7 1 24.824V21.44h.733c.406 0 .734-.355.734-.794 0-.44-.328-.794-.734-.794H1V2.588C1 1.712 1.657 1 2.467 1h19.066C22.343 1 23 1.712 23 2.588v17.265zM4.667 21.44h1.466c.406 0 .734-.355.734-.794 0-.44-.328-.794-.734-.794H4.667c-.406 0-.734.355-.734.794 0 .44.328.794.734.794zm4.4 0h1.466c.406 0 .734-.355.734-.794 0-.44-.328-.794-.734-.794H9.067c-.406 0-.734.355-.734.794 0 .44.328.794.734.794zm4.4 0h1.466c.406 0 .734-.355.734-.794 0-.44-.328-.794-.734-.794h-1.466c-.406 0-.734.355-.734.794 0 .44.328.794.734.794zm4.4 0h1.466c.406 0 .734-.355.734-.794 0-.44-.328-.794-.734-.794h-1.466c-.406 0-.734.355-.734.794 0 .44.328.794.734.794zM5 3.5A1.5 1.5 0 003.5 5v9A1.5 1.5 0 005 15.5h14a1.5 1.5 0 001.5-1.5V5A1.5 1.5 0 0019 3.5H5zM4.5 5a.5.5 0 01.5-.5h14a.5.5 0 01.5.5v9a.5.5 0 01-.5.5H5a.5.5 0 01-.5-.5V5z"
  }));
};

SvgTicket.propTypes = {
  title: propTypes.string
};
SvgTicket.defaultProps = {
  title: ''
};

var _excluded$S = ["title", "titleId"];

var SvgTwitter = function SvgTwitter(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$S);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M19 7.42a5.49 5.49 0 01-1.65.477 3.012 3.012 0 001.264-1.675 5.566 5.566 0 01-1.825.734A2.798 2.798 0 0014.692 6c-1.585 0-2.87 1.356-2.87 3.03 0 .237.024.467.073.69-2.387-.127-4.503-1.332-5.92-3.167-.248.449-.39.97-.39 1.525 0 1.05.508 1.978 1.279 2.52a2.76 2.76 0 01-1.302-.377v.037c0 1.469.99 2.693 2.305 2.97a2.718 2.718 0 01-1.298.053c.366 1.204 1.426 2.08 2.684 2.103A5.575 5.575 0 015 16.64 7.839 7.839 0 009.403 18c5.284 0 8.172-4.615 8.172-8.619 0-.132-.002-.263-.007-.392A5.998 5.998 0 0019 7.42"
  }));
};

SvgTwitter.propTypes = {
  title: propTypes.string
};
SvgTwitter.defaultProps = {
  title: ''
};

var _excluded$T = ["title", "titleId"];

var SvgUnlock = function SvgUnlock(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$T);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 56 56",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M42.315 22.461h-1.862v-6.92h-6.919v6.92H22.48v-6.92h-6.918v6.92h-1.877v3.288h1.877v5.18c0 6.481 5.606 11.77 12.485 11.77 6.84 0 12.406-5.289 12.406-11.77v-5.18h1.862zm-8.78 8.468a5.515 5.515 0 01-5.488 5.567 5.583 5.583 0 01-5.567-5.567v-5.18h11.054z"
  }));
};

SvgUnlock.propTypes = {
  title: propTypes.string
};
SvgUnlock.defaultProps = {
  title: ''
};

var _excluded$U = ["title", "titleId"];

var SvgUnlockWordMark = function SvgUnlockWordMark(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$U);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 1200 256",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M449.94 230.054h53.04V0h-53.04zM215.102 15.976h-55.596v55.608H70.68V15.976H15.083v55.608H0v26.42h15.083v41.626c0 52.081 45.052 94.578 100.33 94.578 54.956 0 99.689-42.497 99.689-94.578V98.004h14.964v-26.42h-14.964zM159.506 139.63c0 24.603-19.49 44.732-44.094 44.732A44.864 44.864 0 0170.68 139.63V98.004h88.826zm189.15-72.53c-19.17 0-37.703 8.626-48.247 24.282h-.639l-3.195-19.81h-46.65v158.482h53.04v-82.436c0-18.213 14.06-32.91 30.994-32.91 17.573 0 31.312 14.697 31.312 32.271v83.075h53.04v-88.187c0-42.177-26.839-74.768-69.654-74.768zm680.878 77.322l65.181-72.85h-65.5l-51.124 59.43h-.959V0h-53.04v230.054h53.04v-72.212h.96l52.72 72.212h66.78zM613.208 67.1c-49.525 0-90.423 37.703-90.423 83.714s40.898 83.395 90.423 83.395 90.424-37.384 90.424-83.395-40.898-83.714-90.424-83.714zm0 120.778c-20.13 0-37.064-16.934-37.064-37.064s16.935-37.064 37.064-37.064 37.384 16.934 37.384 37.064-17.254 37.064-37.384 37.064zm201.61-74.448c15.657 0 28.438 8.947 33.231 21.408h53.998c-5.431-37.064-41.537-67.738-86.27-67.738-49.845 0-91.063 37.703-91.063 83.714s41.218 83.395 91.064 83.395c43.773 0 81.157-29.396 86.27-68.058h-53.999c-5.752 13.1-17.574 21.408-33.23 21.408a36.955 36.955 0 01-36.744-36.745c0-20.13 16.295-37.384 36.744-37.384z"
  }));
};

SvgUnlockWordMark.propTypes = {
  title: propTypes.string
};
SvgUnlockWordMark.defaultProps = {
  title: ''
};

var _excluded$V = ["title", "titleId"];

var SvgUpload = function SvgUpload(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$V);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12.38 3.175a.5.5 0 00-.76 0l-2 2.333a.5.5 0 00.76.65l1.12-1.306V12.5a.5.5 0 001 0V4.852l1.12 1.307a.5.5 0 10.76-.651l-2-2.333zM6.5 9a.5.5 0 00-.5.5v8a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-8a.5.5 0 00-.5-.5h-3a.5.5 0 000 1H17v7H7v-7h2.5a.5.5 0 000-1h-3z"
  }));
};

SvgUpload.propTypes = {
  title: propTypes.string
};
SvgUpload.defaultProps = {
  title: ''
};

var _excluded$W = ["title", "titleId"];

var SvgWallet = function SvgWallet(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$W);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M14 3.8H1.5v-.51l11-.894v.895H14V1.766C14 .647 13.109-.137 12.021.02L1.98 1.478C.891 1.637 0 2.681 0 3.8v10.168C0 15.088.895 16 2 16h12c1.104 0 2-.911 2-2.034V5.834c0-1.123-.896-2.034-2-2.034zm-1.5 7.122c-.828 0-1.5-.683-1.5-1.525 0-.841.672-1.525 1.5-1.525s1.5.684 1.5 1.525c0 .842-.672 1.525-1.5 1.525z"
  }));
};

SvgWallet.propTypes = {
  title: propTypes.string
};
SvgWallet.defaultProps = {
  title: ''
};

var _excluded$X = ["title", "titleId"];

var SvgWalletConnect = function SvgWalletConnect(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$X);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 27 16",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M5.823 3.126c4.24-4.168 11.114-4.168 15.354 0l.51.502a.527.527 0 010 .754L19.943 6.1a.275.275 0 01-.384 0l-.702-.69c-2.958-2.909-7.754-2.909-10.712 0l-.752.738a.275.275 0 01-.384 0L5.263 4.431a.527.527 0 010-.754l.56-.55zm18.964 3.549l1.554 1.527a.527.527 0 010 .755l-7.005 6.887a.55.55 0 01-.768 0l-4.972-4.888a.137.137 0 00-.192 0l-4.972 4.888a.55.55 0 01-.767 0L.659 8.957a.527.527 0 010-.755l1.554-1.527a.55.55 0 01.767 0l4.972 4.888a.137.137 0 00.192 0l4.972-4.888a.55.55 0 01.768 0l4.972 4.888a.137.137 0 00.192 0l4.972-4.888a.55.55 0 01.767 0z"
  }));
};

SvgWalletConnect.propTypes = {
  title: propTypes.string
};
SvgWalletConnect.defaultProps = {
  title: ''
};

var _excluded$Y = ["title", "titleId"];

var SvgWebflow = function SvgWebflow(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$Y);

  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 25 17",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    d: "M18.545 4.97s-2.032 6.246-2.182 6.776C16.303 11.226 14.822 0 14.822 0c-3.463 0-5.304 2.416-6.285 4.97 0 0-2.472 6.265-2.672 6.786-.01-.491-.38-6.728-.38-6.728C5.274 1.895 2.361 0 0 0l2.842 17c3.623-.01 5.575-2.416 6.596-4.98 0 0 2.171-5.528 2.261-5.774C11.72 6.482 13.261 17 13.261 17c3.633 0 5.594-2.249 6.645-4.714L25 0c-3.593 0-5.484 2.406-6.455 4.97z"
  }));
};

SvgWebflow.propTypes = {
  title: propTypes.string
};
SvgWebflow.defaultProps = {
  title: ''
};

var _excluded$Z = ["title", "titleId"];

var SvgWithdraw = function SvgWithdraw(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$Z);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 4.5a6.5 6.5 0 00-3 12.268v1.108A7.502 7.502 0 0112 3.5a7.5 7.5 0 013 14.376v-1.108A6.5 6.5 0 0012 4.5zm-.485 9.599c-.48-.036-.885-.147-1.215-.333-.33-.186-.6-.423-.81-.711l.649-.621c.204.246.42.438.648.576.227.132.486.213.773.243v-2.061l-.207-.036a2.732 2.732 0 01-.764-.243 1.648 1.648 0 01-.514-.396 1.504 1.504 0 01-.287-.513 2.04 2.04 0 01-.09-.612c0-.51.159-.915.476-1.215.319-.306.766-.489 1.341-.549v-.927h.756v.927c.396.042.738.141 1.026.297.288.156.537.369.747.639l-.657.594a1.792 1.792 0 00-.504-.45 1.604 1.604 0 00-.656-.216V10.4l.242.036c.3.054.556.135.766.243.21.108.38.24.513.396.138.15.237.321.296.513.06.192.09.396.09.612 0 .516-.162.939-.486 1.269-.317.33-.777.531-1.377.603v.945h-.756v-.918zm-.864-4.734c0 .252.07.45.207.594.144.138.378.243.702.315v-1.8c-.606.072-.909.369-.909.891zm2.53 2.88c0-.27-.075-.474-.225-.612-.144-.144-.387-.249-.73-.315v1.926c.313-.048.55-.156.711-.324.163-.168.244-.393.244-.675zM12 22.5a.5.5 0 01-.38-.175l-2-2.333a.5.5 0 01.76-.65l1.12 1.306V16.5a.5.5 0 011 0v4.148l1.12-1.307a.5.5 0 11.76.651l-2 2.333a.5.5 0 01-.38.175z"
  }));
};

SvgWithdraw.propTypes = {
  title: propTypes.string
};
SvgWithdraw.defaultProps = {
  title: ''
};

var _excluded$_ = ["title", "titleId"];

var SvgWordpress = function SvgWordpress(_ref) {
  var title = _ref.title,
      titleId = _ref.titleId,
      props = _objectWithoutPropertiesLoose(_ref, _excluded$_);

  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#wordpress_svg__clipPath18)",
    transform: "matrix(1.33333 0 0 -1.33333 0 336)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M201.164 166.153c6.632-12.1 10.406-25.988 10.406-40.76 0-31.345-16.987-58.71-42.246-73.438l25.95 75.03c4.847 12.121 6.461 21.813 6.461 30.431 0 3.128-.206 6.031-.57 8.737m-62.847-.925c5.115.27 9.724.807 9.724.807 4.578.542 4.038 7.27-.542 7.002 0 0-13.762-1.08-22.646-1.08-8.348 0-22.376 1.08-22.376 1.08-4.582.268-5.119-6.73-.539-7.002 0 0 4.334-.538 8.912-.807l13.236-36.269-18.596-55.763-30.938 92.032c5.12.27 9.723.807 9.723.807 4.575.542 4.035 7.27-.543 7.002 0 0-13.759-1.08-22.644-1.08-1.594 0-3.473.04-5.468.103 15.192 23.064 41.304 38.295 70.988 38.295 22.118 0 42.258-8.457 57.373-22.307-.366.022-.723.068-1.1.068-8.346 0-14.268-7.27-14.268-15.079 0-7.002 4.04-12.926 8.346-19.927 3.231-5.659 7.005-12.928 7.005-23.432 0-7.27-2.797-15.71-6.465-27.466l-8.477-28.315zM126.61 40.424a84.934 84.934 0 00-24.003 3.462l25.495 74.075 26.114-71.549c.172-.42.383-.807.608-1.17a84.783 84.783 0 00-28.214-4.818m-84.962 84.97a84.622 84.622 0 007.357 34.576l40.53-111.042c-28.346 13.77-47.887 42.835-47.887 76.465m84.962 94.497c-52.107 0-94.499-42.39-94.499-94.497 0-52.108 42.392-94.504 94.5-94.504 52.105 0 94.5 42.396 94.5 94.504 0 52.106-42.395 94.497-94.5 94.497"
  })));
};

SvgWordpress.propTypes = {
  title: propTypes.string
};
SvgWordpress.defaultProps = {
  title: ''
};

function wrapViewBox(WrappedComponent, viewBox) {
  var Wrapped = function Wrapped(props) {
    return /*#__PURE__*/React__default.createElement(WrappedComponent, _extends({
      viewBox: viewBox
    }, props));
  };

  return Wrapped;
}

var SvgComponents = {
  About: SvgAbout,
  Adfree: wrapViewBox(SvgAdfree, '-3 -7 36 36'),
  AppStore: wrapViewBox(SvgAppStore, '0 0 24 24'),
  Arrow: wrapViewBox(SvgArrow, '0 0 24 24'),
  Attention: wrapViewBox(SvgAttention, '0 0 96 96'),
  Bars: wrapViewBox(SvgBars, '0 0 56 42'),
  Blog: SvgBlog,
  Carret: wrapViewBox(SvgCarret, '-6 -8 24 24'),
  Cart: wrapViewBox(SvgCart, '-3 -3 24 24'),
  Checkmark: wrapViewBox(SvgCheckmark, '0 0 24 24'),
  ChevronUp: wrapViewBox(SvgChevronUp, '0 0 58 32'),
  Close: wrapViewBox(SvgClose, '0 0 24 24'),
  Cloudflare: wrapViewBox(SvgCloudflare, '-4 -4 32 32'),
  Code: wrapViewBox(SvgCode, '0 0 24 24'),
  Cog: SvgCog,
  CoinbaseWallet: SvgCoinbaseWallet,
  Copy: wrapViewBox(SvgCopy, '0 0 24 24'),
  CreditCard: wrapViewBox(SvgCreditCard, '-12 -16 48 48'),
  Decentraland: wrapViewBox(SvgDecentraland, '0 0 512 512'),
  Discord: wrapViewBox(SvgDiscord, '-4 -4 32 32'),
  Discourse: wrapViewBox(SvgDiscourse, '-5 -3 32 32'),
  Docs: wrapViewBox(SvgDocs, '-6 -5 24 24'),
  Documentation: wrapViewBox(SvgDocumentation, '-6 -6 76 76'),
  Download: wrapViewBox(SvgDownload, '0 0 24 24'),
  Edit: wrapViewBox(SvgEdit, '0 0 24 24'),
  Eth: wrapViewBox(SvgEth, '0 0 24 24'),
  Etherscan: wrapViewBox(SvgEtherscan, '0 0 24 24'),
  EthSub: wrapViewBox(SvgEthSub, '0 0 24 24'),
  Export: wrapViewBox(SvgExport, '0 0 24 24'),
  Firebase: wrapViewBox(SvgFirebase, '-6 0 150 140'),
  Github: wrapViewBox(SvgGithub, '0 0 24 24'),
  Heart: wrapViewBox(SvgHeart, '-6 -6 36 36'),
  Home: SvgHome,
  Idea: SvgIdea,
  Info: SvgInfo,
  Jobs: wrapViewBox(SvgJobs, '0 0 24 24'),
  Key: SvgKey,
  Lemniscate: wrapViewBox(SvgLemniscate, '0 0 24 24'),
  LiveDemo: wrapViewBox(SvgLiveDemo, '0 0 64 64'),
  Loading: wrapViewBox(SvgLoading, '0 0 32 32'),
  LoadingDots: SvgLoadingDots,
  Lock: wrapViewBox(SvgLock, '-15 -4 120 120'),
  LockClosed: wrapViewBox(SvgLockClosed, '0 0 24 24'),
  Log: wrapViewBox(SvgLog, '0 0 24 24'),
  Members: wrapViewBox(SvgMembers, '-4 -4 24 24'),
  Metamask: SvgMetamask,
  Newsletter: wrapViewBox(SvgEmail, '0 0 24 24'),
  Opera: SvgOpera,
  Person: wrapViewBox(SvgPerson, '-6.5 -5 32 32'),
  Preview: wrapViewBox(SvgPreview, '0 0 24 24'),
  Qr: wrapViewBox(SvgQr, '0 0 60 60'),
  Shopify: wrapViewBox(SvgShopify, '-4 -4 40 40'),
  Telegram: wrapViewBox(SvgTelegram, '0 0 24 24'),
  Ticket: wrapViewBox(SvgTicket, '-8 -6 40 40'),
  Twitter: wrapViewBox(SvgTwitter, '0 0 24 24'),
  Unlock: wrapViewBox(SvgUnlock, '0 0 56 56'),
  UnlockWordMark: wrapViewBox(SvgUnlockWordMark, '0 0 1200 256'),
  Upload: wrapViewBox(SvgUpload, '0 0 24 24'),
  Wallet: wrapViewBox(SvgWallet, '-8 -8 32 32'),
  WalletConnect: wrapViewBox(SvgWalletConnect, '-3 -6 32 32'),
  Webflow: wrapViewBox(SvgWebflow, '-4 -8 32 32'),
  Withdraw: wrapViewBox(SvgWithdraw, '0 0 24 24'),
  Wordpress: wrapViewBox(SvgWordpress, '0 0 340 340')
};

var index = {
  SvgComponents: SvgComponents
};

module.exports = index;
//# sourceMappingURL=index.js.map
