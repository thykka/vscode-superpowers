# Superpowers

This VSCode extension gives you superpowers in the form of JavaScript expressions, that can be used to map or sort multi-selections.

## Features

- Perform map operations on a selection or multiple selections
- Perform sort operations on a multiple selection
- Generate text via JavaScript expressions
- Save your expressions as presets for easy access


## Requirements

none

## Usage

1. Press `Cmd` + `Shift` + `P` to open the command palette.
1. Type "super" and choose either `Superpresets`, `Supersorts` or `Superpowers` to open a list of map presets, a list of sort presets or a map function input box, respectively.
1. Choose a preset or write a custom function.

## Notes

- Custom map functions and presets receive the same parameters as native JavaScript Array.prototype.map, i.e. `value`, `index` and `array`.
- Custom sort functions[1] and presets

## Extension Settings

This extension contributes the following settings:

* `superpowers.mapPresets`: List of map presets as an array of objects, such as:
  ```json
  {
    "name": "replace with index",
    "function": "(_, i) => i + 1"
  }
  ```
* `superpowers.sortPresets`: List of sort presets as an array of objects, such as:
  ```json
  {
    "name": "sort by codepoint",
    "function": "(a, b) => a.charCodeAt(0) - b.charCodeAt(0)"
  }
  ```

## Known Issues

(No documented issues. Please report issues via issue tracker)

## Release Notes

Extension is still in early phases of development. Expect things to change or be broken.

### 0.0.3

Initial publish

### 0.0.1

Initial release


## Roadmap

### Next

  [ ] Add custom sort input box

### Future

  [ ] Add more presets
  [ ] Streamline the UI somehow
  [ ] Implement better preview
