import debounce from 'debounce';

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

  return function(options = {}) {

    // Holds component state
    let state = Object.assign({},
      stateInit instanceof Function ? stateInit(options) : stateInit, // Support plain objects for backwards compatibility
      { initialised: false }
    );

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
      updateFn.call(comp, state);
    }, 1);

    // Getter/setter methods
    props.forEach(prop => {
      comp[prop.name] = getSetProp(prop.name, prop.triggerUpdate, prop.onChange);

      function getSetProp(prop, redigest = false,  onChange = (newVal, state) => {}) {
        return function(_) {
          const curVal = state[prop];
          if (!arguments.length) { return curVal } // Getter mode
          state[prop] = _;
          onChange.call(comp, _, state, curVal);
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

    return comp;
  }
}
