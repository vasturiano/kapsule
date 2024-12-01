import debounce from 'lodash-es/debounce.js';

class Prop {
  constructor(name, {
    default: defaultVal = null,
    triggerUpdate = true,
    onChange = (newVal, state) => {}
  }) {
    this.name = name;
    this.defaultVal = defaultVal;
    this.triggerUpdate = triggerUpdate;
    this.onChange = onChange;
  }
}

export default function ({
  stateInit = (() => ({})),
  props: rawProps = {},
  methods = {},
  aliases = {},
  init: initFn = (() => {}),
  update: updateFn = (() => {})
}) {

  // Parse props into Prop instances
  const props = Object.keys(rawProps).map(propName =>
    new Prop(propName, rawProps[propName])
  );

  return function KapsuleComp(...args) {
    const classMode = !!new.target;

    const nodeElement = classMode ? args.shift() : undefined;
    const [options = {}] = args;

    // Holds component state
    let state = Object.assign({},
      stateInit instanceof Function ? stateInit(options) : stateInit, // Support plain objects for backwards compatibility
      { initialised: false }
    );

    // keeps track of which props triggered an update
    let changedProps = {};

    // Component constructor
    function comp(nodeElement) {
      initStatic(nodeElement, options);
      digest();

      return comp;
    }

    const initStatic = function(nodeElement, options) {
      initFn.call(comp, nodeElement, state, options);
      state.initialised = true;
    };

    const digest = debounce(() => {
      if (!state.initialised) { return; }
      updateFn.call(comp, state, changedProps);
      changedProps = {};
    }, 1);

    // Getter/setter methods
    props.forEach(prop => {
      comp[prop.name] = getSetProp(prop);

      function getSetProp({
        name: prop,
        triggerUpdate: redigest = false,
        onChange = (newVal, state) => {},
        defaultVal = null
      }) {
        return function(_) {
          const curVal = state[prop];
          if (!arguments.length) { return curVal } // Getter mode

          const val = _ === undefined ? defaultVal : _; // pick default if value passed is undefined
          state[prop] = val;
          onChange.call(comp, val, state, curVal);

          // track changed props
          !changedProps.hasOwnProperty(prop) && (changedProps[prop] = curVal);

          if (redigest) { digest(); }
          return comp;
        }
      }
    });

    // Other methods
    Object.keys(methods).forEach(methodName => {
      comp[methodName] = (...args) => methods[methodName].call(comp, state, ...args);
    });

    // Link aliases
    Object.entries(aliases).forEach(([alias, target]) => comp[alias] = comp[target]);

    // Reset all component props to their default value
    comp.resetProps = function() {
      props.forEach(prop => {
        comp[prop.name](prop.defaultVal);
      });
      return comp;
    };

    //

    comp.resetProps(); // Apply all prop defaults
    state._rerender = digest; // Expose digest method

    classMode && comp(nodeElement);

    return comp;
  }

  //

  class KapsuleClass {
    constructor(nodeElement, options = {}) {
      // Holds component state
      const state = Object.assign({}, stateInit(options));

      // keeps track of which props triggered an update
      let changedProps = {};

      const digest = state._rerender = debounce(() => {
        updateFn.call(this, state, changedProps);
        changedProps = {};
      }, 1);

      // Getter/setter methods
      props.forEach(prop => {
        this[prop.name] = getSetProp(prop);

        const comp = this;
        function getSetProp({
          name: prop,
          triggerUpdate: redigest = false,
          onChange = (newVal, state) => {},
          defaultVal = null
        }) {
          return (_) => {
            const curVal = state[prop];
            if (!arguments.length) { return curVal } // Getter mode

            const val = _ === undefined ? defaultVal : _; // pick default if value passed is undefined
            state[prop] = val;
            onChange.call(this, val, state, curVal);

            // track changed props
            !changedProps.hasOwnProperty(prop) && (changedProps[prop] = curVal);

            if (redigest) { digest(); }
            return comp;
          }
        }
      });

      // Other methods
      Object.keys(methods).forEach(methodName => {
        this[methodName] = (...args) => methods[methodName].call(this, state, ...args);
      });

      // Link aliases
      Object.entries(aliases).forEach(([alias, target]) => this[alias] = this[target]);

      this.resetProps(); // Apply all prop defaults
      initFn.call(this, nodeElement, state, options);
      digest();
    }

    // Reset all component props to their default value
    resetProps() {
      props.forEach(prop => {
        this[prop.name](prop.defaultVal);
      });
      return this;
    };
  }
}