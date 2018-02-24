# boolean-exp-minimizer

>A boolean expression minimizer for Node.js

## Install

`npm install --save boolean-exp-minimizer`

## Usage

```js
const Bem = require('boolean-exp-minimizer');

const booleanExp = new Bem(4);

booleanExp.push(1);
booleanExp.push(3);
booleanExp.push(7);
booleanExp.push(9);
booleanExp.pushDontCare(4);
booleanExp.pushDontCare(15);

// To minimize the expression
booleanExp.min();

// To show the expression minimized
console.log(booleanExp.toString());
```

## API

### Bem(size, options)

#### size

Type: `integer`

It's the number of boolean variables.

#### options

Type: `object`

##### - alpha

Type: `array`<br>
Default: `['x', 'y', 'z', 's', 't', 'v']`

It's the expression alphabet.

##### - name

Type: `string`

The name of expression.

### .push(num)

Adds the minterm identified by the rappresentation in binary of *num*.<br>
For example, booleanExp.push(3) above adds 0011, than not(x)not(y)zs.

#### num

Type: `integer`

The binary rappresentation of a minterm.

### .pushDontCare(num)

It allows to push a *don't care* minterm. 
