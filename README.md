# Superpowers

This VSCode extension gives you superpowers in the form of JavaScript expressions, that can be used to map or sort multi-selections.

## Features

- Perform map operations on a selection or multiple selections
- Perform sort operations on a multiple selection
- Generate text via JavaScript expressions
- Save your expressions as presets for easy access

## Requirements

none

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

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

### 0.0.1

Initial release
