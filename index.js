class Prop {
	constructor(name, { default: defaultVal = null, triggerUpdate = true, onChange = (newVal, state) => {}}) {
		this.name = name;
		this.defaultVal = defaultVal;
		this.triggerUpdate = triggerUpdate;
		this.onChange = onChange;
	}
}

export default function ({
		props: rawProps = {},
		methods = {},
		init: initFn = (() => {}),
		update: updateFn = (() => {})
	}) {

	// Parse props into Prop instances
	const props = Object.keys(rawProps).map(propName =>
		new Prop(propName, rawProps[propName])
	);

	return function() {

		// Holds component state
		let state = {
			initialised: false
		};

		// Component constructor
		function comp(nodeElement) {
			initStatic(nodeElement);
			digest();

			return comp;
		}

		// Getter/setter methods
		props.forEach(prop => {
			comp[prop.name] = getSetProp(prop.name, prop.triggerUpdate, prop.onChange);
			state[prop.name] = prop.defaultVal;
			prop.onChange(prop.defaultVal, state);

			function getSetProp(prop, redigest = false,  onChange = (newVal, state) => {}) {
				return _ => {
					if (!arguments.length) { return state[prop] }
					state[prop] = _;
					onChange(_, state);
					if (redigest) { digest(); }
					return comp;
				}
			}
		});

		// Other methods
		Object.keys(methods).forEach(methodName => {
			comp[methodName] = (...args) => methods[methodName](state, ...args);
		});

		// Reset all component props to their default value
		comp.resetProps = function() {
			props.forEach(prop => {
				state[prop.name] = prop.defaultVal;
				prop.onChange(prop.defaultVal, state);
			});
			digest();	// Re-digest after resetting props

			return comp;
		};

		//

		function initStatic(nodeElement) {
			initFn(nodeElement, state);
			state.initialised = true;
		}

		function digest() {
			if (!state.initialised) { return; }
			updateFn(state);
		}

		return comp;
	}
}
