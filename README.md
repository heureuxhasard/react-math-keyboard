# react-math-keyboard

[![npm](https://badgen.net/npm/v/react-math-keyboard)](https://www.npmjs.com/package/react-math-keyboard)

This library provides :

- a [MathQuill](http://www.mathquill.com) input in which you can write both mathematical expressions (in LaTeX) and raw text
- a customizable, pretty, mobile-friendly keyboard for this input.

You can test it in CodeSandbox : [js version](https://codesandbox.io/s/epic-wildflower-v1jlww) or [ts version](https://codesandbox.io/s/react-mat-keyboard-ts-playground-w01638).

:warning: This is using a fork of MathQuill in order to use the comma as a decimal separator and the symbol $\times$ instead of $\cdot$ for multiplication. This is not customizable so far, but could be in the future if there are requests for it.

This library is used by [Mathlive.fr](https://www.mathlive.fr).

## Basic usage

Install the package :

```nodejs
npm i react-math-keyboard
```

Then import the MathInput :

```jsx
import MathInput from "react-math-keyboard";
```

You can then use it with no configuration :

```jsx
<MathInput />
```

Getting the value of the input as a LaTeX string :

```jsx
const [latex, setLatex] = useState("")
//...later
<MathInput setValue={setLatex} />
```

If you need to do more specific stuff with the input, you should retrieve the ref to the MathField, and then the whole [MathQuill API](http://docs.mathquill.com/en/latest/Api_Methods/) is available to use.

```jsx
const mf = useRef<MathField>();
const onClick = () => mf.current.latex("click!");

//...later
<MathInput setMathfieldRef={(mathfield)=>mf.current=mathfield} />
<button onClick={onClick}>Click me</button>
```

## Customizing the keyboard

You can hide the toolbar if you don't need additional keys :

```js
<MathInput numericToolbarKeys={[]} />
```

Or you can provide an array of [KeyIds](https://github.com/heureuxhasard/react-math-keyboard/tree/main/src/keyboard/keys/keyIds.ts) or KeyProps if you only want certain keys. Here is the format for KeyProps :

| Prop : Type                                     | Default     | Description                                                                                                                                 |
| ----------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `id: KeyId`                                     | none        | Use a [KeyId](https://github.com/heureuxhasard/react-math-keyboard/tree/main/src/keyboard/keys/keyIds.ts) or "custom" for defining your own key |
| `label: string \| ReactNode`                    | none        | What's displayed on the keyboard                                                                                                            |
| `labelType: "raw" \| "tex" \| "svg"`            | none        | Type of the label                                                                                                                           |
| `mathfieldInstructions?: MathfieldInstructions` | `undefined` | An objet `{ method , content }`, with content being a string and method is one of the MathQuill Api methods.                                |
| `onClick?: () => void`                          | `undefined` | To provide custom logic to the key                                                                                                          |
| `fullWidth?: boolean`                           | `true`      | shorthand for `width='100%'`                                                                                                                |
| `isUtilityKey?: boolean`                        | `false`     | Utility keys have a different background                                                                                                    |

Example :

```js
<MathInput
  numericToolbarKeys={[
    "cos",
    "sin",
    "tan",
    {
      id: "custom",
      label: "custom label",
      labelType: "raw",
      mathfieldInstructions: {
        method: "write",
        content: "custom content",
      },
    },
  ]}
/>
```

## All the MathInput Props

| Prop: Type                                      | Default value | Description                                                                                                                                                                                                                                                             |
| ----------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lang?: ("en"\|"fr")`                           | `en`          | Defines the language, currently only English and French suppported                                                                                                                                                                                                      |
| `numericToolbarKeys?: (KeyId \| KeyProps)[]`    | `undefined`   | <ul><li> `undefined` : All the keys </li><li> `Empty array` : No toolbar </li><li> `Otherwise` : the keys you've provided </li></ul>                                                                                                                                    |
| `numericToolbarTabs?: KeyGroupIds[]`            | `undefined`   | Choose the options you want in the select menu of the toolbar. See [KeyGroup](https://github.com/heureuxhasard/react-math-keyboard/tree/main/src/keyboard/keys/keyGroup.ts) for a list of options                                                                           |
| `allowAlphabeticKeyboard?: boolean`             | `true`        | Hide/show the alphabetic keyboard                                                                                                                                                                                                                                       |
| `alphabeticToolbarKeys?: (KeyId \| KeyProps)[]` | `undefined`   | Same thing that `numericToolbarKeys` but for the alphabetic keyboard                                                                                                                                                                                                    |
| `setMathfieldRef?: (mf: MathField) => void`     | `undefined`   | Retrieve the ref to the MathQuill input in order to use the MathQuill Api                                                                                                                                                                                               |
| `setClearRef?: (f: () => void) => void`         | `undefined`   | Pass it a ref in order to have a shorthand for clearing the input. e.g : `setClearRef( f => myRef.current = f)` then `myRef.current()` somewhere in your App                                                                                                            |
| `initialLatex?: string`                         | `undefined`   | This latex will be shown in the input at the initial render. Updates of this prop won't affect the input. You should interact with the MathField ref directly if you want to do stuff with the input.                                                                   |
| `setValue?: (s: string) => void`                | `undefined`   | To retrieve the latex                                                                                                                                                                                                                                                   |
| `divisionFormat?: "fraction" \| "obelus"`       | `"fraction"`  | Whether to show divisions as fractions or with the division symbol ÷                                                                                                                                                                                                    |
| `style?: React.CSSProperties`                   | `{}`          | CSS for the input                                                                                                                                                                                                                                                       |
| `size?: "small" \| "medium"`                    | `"medium"`    | Shorthand to change the padding of the input                                                                                                                                                                                                                            |
| `rootElementId?: string`                        | `undefined`   | By default, the keyboard applies a padding bottom on the \<body\> in order to not overflow the input. You can use this prop to set this padding on another element than the body. For example, you can target Nextjs' root element by doing rootElementId = "\_\_next". |
| `fullWidth?: boolean`                           | `true`        | Shorthand for `width="100%"`                                                                                                                                                                                                                                            |

## Contributing

Don't hesitate to give feedback, and any contribution is welcomed !
