# Kapsule

A Simple Web Component library, inspired by the [reusable charts pattern](https://bost.ocks.org/mike/chart/) commonly found in [D3](https://d3js.org/) components.

[![NPM](https://nodei.co/npm/kapsule.png?compact=true)](https://nodei.co/npm/kapsule/)

## Quick start

```
import Kapsule from 'kapsule';
```
or
```
var Kapsule = require('kapsule');
```
or even
```
<script src="//unpkg.com/kapsule/dist/kapsule.min.js"></script>
```

## Usage example

### Define the component
```
const ColoredText = Kapsule({
    
    props: {
        color: { default: 'red' },
        text: {}
    },
    
    init: (domElement, state) => {
        state.elem = document.createElement('span');
        domElement.appendChild(state.elem);
    },
    
    update: state => {
        state.elem.style.color = state.color;
        state.elem.textContent = state.text;
    }

});
```

### Instantiate the component

```
let myText = ColoredText();
```

### Render

```
myText(<myDOMElement>)
    .color('blue')
    .text('foo');
```

## How to build

```
npm install
npm run build
```
