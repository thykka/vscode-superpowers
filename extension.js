const vscode = require('vscode');

class Superpowers {
  constructor(options) {
    const defaults = {
      lastMapString: '(value, index, array) => value',
      lastSortString: '(a, b) => a - b',
      mapPresets: {},
      sortPresets: {}
    };
    Object.assign(this, defaults, options);

    this._loadPresets();
  }

  _loadPresets() {
    let config = vscode.workspace.getConfiguration('superpowers');

    config.get('mapPresets').forEach(preset => {
      this.mapPresets[preset.name] = preset.function;
    }, this);

    config.get('sortPresets').forEach(preset => {
      this.sortPresets[preset.name] = preset.function;
    }, this);
  }

  showMapInput(validate = true) {
    vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: this.lastMapString,
      value: this.lastMapString,
      prompt: 'Go nuts!',
      validateInput: validate ? this._validateMapInput.bind(this) : () => {},
    }).then(this._processMapInput.bind(this));
  }

  showSortInput(validate = true) {
    vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: this.lastSortString,
      value: this.lastSortString,
      prompt: 'Go nuts!',
      validateInput: validate ? this._validateSortInput.bind(this) : () => {},
    }).then(this._processSortInput.bind(this));
  }

  showMapPresets() {
    vscode.window.showQuickPick(
      Object.keys(this.mapPresets),
      { canPickMany: false }
    ).then((selection) => {
      this.lastMapString = this.mapPresets[selection];
      this._processMapInput(this.lastMapString);
    }).catch(this._showError);
  }

  showSortPresets() {
    vscode.window.showQuickPick(
      Object.keys(this.sortPresets),
      { canPickMany: false }
    ).then((selection) => {
      this.lastSortString = this.sortPresets[selection];
      this._processSortInput(this.lastSortString);
    }).catch(this._showError);
  }

  _showError(error) {
    vscode.window.showInformationMessage(
      error.toString()
    );
  }

  _validateMapInput(input) {
    try {
      const mapFn = eval(input);
      const selections = this._getSelections();
      const texts = this._selectionsToText(selections);
      vscode.window.showInformationMessage(
        'Map preview:',
        ...texts.map(mapFn).map(String).slice(0, 3)
      );
      vscode.window.setStatusBarMessage('testings', 500);
    } catch(e) {
      return e.toString();
    }
    return '';
  }

  _validateSortInput(input) {
    try {
      const sortFn = eval(input);
      const selections = this._getSelections();
      const texts = this._selectionsToText(selections);
      vscode.window.showInformationMessage(
        'Sort preview:',
        ...texts.sort(sortFn).map(String).slice(0, 3)
      );
      vscode.window.setStatusBarMessage('testings', 500);
    } catch(e) {
      return e.toString();
    }
    return '';
  }

  _getSelections() {
    const selections = vscode.window.activeTextEditor.selections || [];
    return selections.sort(this._sortSelections);
  }

  _selectionsToText(selections) {
    return selections.map(
      selection => vscode.window.activeTextEditor.document.getText(selection)
    );
  }

  _processMapInput(input) {
    const mapFn = eval(input);
    const selections = this._getSelections();

    const results = this._selectionsToText(selections).map(mapFn).map(String);

    vscode.window.activeTextEditor.edit((builder) => {
      selections.forEach((selection, index) => {
        builder.replace(selection, results[index]);
      });
    });

    this.lastMapString = input;
  }

  _processSortInput(input) {
    const sortFn = eval(input);
    const selections = this._getSelections();
    const texts = this._selectionsToText(selections);
    const sorted = texts.sort(sortFn);
    vscode.window.activeTextEditor.edit((builder) => {
      selections.forEach((selection, index) => {
        builder.replace(selection, sorted[index]);
      });
    });

    this.lastSortString = input;
  }

  _sortSelections(a, b) {
    if(a.start.line !== b.start.line) {
      return a.start.line - b.start.line;
    } else {
      return a.start.character - b.start.character;
    }
  }
}

const superpowers = new Superpowers();

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // The commandId parameter must match the command field in package.json
  let mapInput = vscode.commands.registerTextEditorCommand('superpowers.customMap', () => {
    superpowers.showMapInput();
  });
  let sortInput = vscode.commands.registerTextEditorCommand('superpowers.customSort', () => {
    superpowers.showSortInput();
  });
  let mapPresets = vscode.commands.registerTextEditorCommand('superpowers.mapPresets', () => {
    superpowers.showMapPresets();
  });
  let sortPresets = vscode.commands.registerTextEditorCommand('superpowers.sortPresets', () => {
    superpowers.showSortPresets();
  });

  context.subscriptions.push(mapInput);
  context.subscriptions.push(sortInput);
  context.subscriptions.push(mapPresets);
  context.subscriptions.push(sortPresets);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
