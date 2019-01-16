const vscode = require('vscode');

class Superpowers {
  constructor(options) {
    const defaults = {
      lastMapString: '(v, i, a) => v',
      lastSortString: '(a, b) => a - b',
      mapPresets: {},
      sortPresets: {}
    };

    this.configuration = vscode.workspace.getConfiguration('superpowers');

    Object.assign(this, defaults, options);

    this.configuration.get('mapPresets').forEach(preset => {
      this.mapPresets[preset.name] = preset.function;
    });

    this.configuration.get('sortPresets').forEach(preset => {
      this.sortPresets[preset.name] = preset.function;
    });

  }

  showMapInput(validate = true) {
    vscode.window.showInputBox({
      placeHolder: this.lastMapString,
      value: this.lastMapString,
      prompt: 'Go nuts!',
      validateInput: validate ? this._validateInput.bind(this) : () => {},
    }).then(this._processMapInput.bind(this));
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

  _validateInput(input) {
    try {
      const mapFn = eval(input);
      const selections = this._getSelections();
      const results = this._selectionsToText(selections);
      vscode.window.showInformationMessage(
        mapFn(results[0], 0, [...results])
      );
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
  let mapInput = vscode.commands.registerTextEditorCommand('extension.superpowers', () => {
    superpowers.showMapInput();
  });
  let mapPresets = vscode.commands.registerTextEditorCommand('extension.superpresets', () => {
    superpowers.showMapPresets();
  });
  let sortPresets = vscode.commands.registerTextEditorCommand('extension.supersorts', () => {
    superpowers.showSortPresets();
  });

  context.subscriptions.push(mapInput);
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
