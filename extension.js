const vscode = require('vscode');

class Superpowers {
  constructor(options) {
    const defaults = {
      lastMapString: '(v, i, a) => v',
      mapPresets: {
        'append difference between times': '(v) => { var times = v.match(/[0-9]+:[0-9]+/g).map(t => { let parts = t.split(\':\'); return parseInt(parts[0]) + (parts[1] / 60) }); return v + \' (\' + (times[1] - times[0]) + \'h)\'; }',
        'convert UPPERCASE': '(v) => v.toUpperCase()',
        'convert lowercase': '(v) => v.toLowerCase()',
        'convert camelCase': '(v) => v.trim().replace(/(?:^|\\s|_|-+)(\\w)/g, (_, c, o) => o !== 0 ? c.toUpperCase() : c)',
        'insert current time (rounded)': '() => { let now = new Date( Math.round(Date.now() / 1000 / 60 / 15) * 1000 * 60 * 15 ); return now.getHours() + \':\' + now.getMinutes() }',
        'prefix index': '(v, i) => `${i+1}. ${v}`',
      },
      lastSortString: '(a, b) => a - b',
      sortPresets: {
        'natural (alphanumeric)': `(s1, s2) => {
          const a = s1.split(/(\\d+|\\D+)/).filter(function(s){return s!=""});
          const b = s2.split(/(\\d+|\\D+)/).filter(function(s){return s!=""});
          let cmp = 0;
          for (let i = 0; 0 == cmp && i < a.length && i < b.length; i++) {
            let n1 = a[i] - 0, n2 = b[i] - 0;
            if (!isNaN(n1) && !isNaN(n2)) cmp = n1 - n2;
            else if (a[i] < b[i]) cmp = -1;
            else if (a[i] > b[i]) cmp = 1;
          }
          return cmp;
        }`,
      }
    };

    Object.assign(this, defaults, options);
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
