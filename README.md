# Superpowers

This VSCode extension gives you superpowers in the form of JavaScript expressions, that can be used to map or sort multi-selections.

## Preview

![Superpowers](https://bitbucket.org/thykka/vscode-superpowers/raw/master/screenshots/superpowers.gif)
![Superpresets](https://bitbucket.org/thykka/vscode-superpowers/raw/master/screenshots/superpresets.gif)

## Features

- Perform map operations on a selection or multiple selections
- Perform sort operations on a multiple selection
- Generate text via JavaScript expressions
- Save your expressions as presets for easy access
- Support for dynamic snippets / completions

## Map/Sort operation usage

1. Select some text. Optionally, use `Cmd` to select multiple regions.
1. Press `Cmd` + `Shift` + `P` to open the command palette.
1. Type "super" to show a list of available commands;

    >### Custom map function

      Type a JavaScript [map callback function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Parameters) and press enter. Your function will get applied to each selection.

    >### Map Presets

      Pick a preset to use as the map function.

    >### Custom sort function

      Type a JavaScript [sort comparison function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Parameters) and press enter to sort the selections.

    >### Sort Presets

      Pick a preset to use as the sort function.

    >### Custom reduce function

      Type a JavaScript [reduce function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Parameters) and press enter to output the result after the selections.


## Dynamic snippets / completion

Currently, only plaintext and markdown documents are supported, and only two snippets are available;

- `RT` - Inserts the current time, rounded to 15 minutes
- `TD` - Calculates the time delta between two times

Type a snippet, and the autocompletion menu should appear.


## Extension Settings

This extension contributes the following settings:

* `superpowers.mapPresets`: List of map presets as an array of objects.

  Example:
  ```json
  {
    "name": "replace with index",
    "function": "(_, i) => i + 1"
  }
  ```
* `superpowers.sortPresets`: List of sort presets as an array of objects.

  Example:
  ```json
  {
    "name": "sort by codepoint",
    "function": "(a, b) => a.charCodeAt(0) - b.charCodeAt(0)"
  }
  ```

## Known Issues

Please report issues via [issue tracker](https://bitbucket.org/thykka/vscode-superpowers/issues?status=new&status=open).

## Release Notes

Extension is still in early phases of development. Expect things to change or be broken.

## Development

1. Open project in VS Code
1. Select `Debug` > `Start Debugging [F5]`
1. ¯\\\_(ツ)_/¯ hack away!

## Building

1. Ensure all changes have been committed.

1.  ```shell
    $ vsce package

    $ vsce publish [patch/major/minor]
    ```
