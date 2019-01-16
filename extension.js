const vscode = require('vscode');

class Superpowers {
  constructor(options) {
    const defaults = {
      execString: '(v, i, a) => v',
      lastExecString: '',
      presets: {
        quantizedTime: '() => { let now = new Date( Math.round(Date.now() / 1000 / 60 / 15) * 1000 * 60 * 15 ); return now.getHours() + \':\' + now.getMinutes() }',
        calculateHours: '(v) => { var times = v.match(/[0-9]+:[0-9]+/g).map(t => { let parts = t.split(\':\'); return parseInt(parts[0]) + (parts[1] / 60) }); return v + \' (\' + (times[1] - times[0]) + \'h)\'; }',
        upperCase: '(v) => v.toUpperCase()',
        lowerCase: '(v) => v.toLowerCase()',
        camelCase: '(v) => v.trim().replace(/(?:^|\\s|_|-+)(\\w)/g, (_, c, o) => o !== 0 ? c.toUpperCase() : c)',
        prefixWithIndex: '(v, i) => `${i+1}. ${v}`',
      }
    };

    Object.assign(this, defaults, options);
  }

  showMapInput() {
    vscode.window.showInputBox({
      placeHolder: this.lastExecString || this.execString,
      value: this.lastExecString || this.execString,
      prompt: 'Go nuts!',
      validateInput: this._validateInput.bind(this)
    }).then(this._processInput.bind(this));
  }

  showPresets() {
    vscode.window.showQuickPick(
      Object.keys(this.presets),
      { canPickMany: false }
    ).then((selection) => {
      this.lastExecString = this.presets[selection];
      this._processInput(this.lastExecString);
    }).catch(reason => {
      vscode.window.showInformationMessage(
        reason.toString()
      );
    });
  }

  _validateInput(input) {
    try {
      const execFn = eval(input);
      const selections = this._getSelections();
      const results = this._selectionsToText(selections);
      vscode.window.showInformationMessage(
        execFn(results[0], 0, [...results])
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

  _processInput(input) {
    const execFn = eval(input);
    const selections = this._getSelections();

    const results = this._selectionsToText(selections).map(execFn).map(String);

    vscode.window.activeTextEditor.edit((builder) => {
      selections.forEach((selection, index) => {
        builder.replace(selection, results[index]);
      });
    });

    this.lastExecString = input;
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
  let directInput = vscode.commands.registerTextEditorCommand('extension.superpowers', () => {
    superpowers.showMapInput();
  });
  let presets = vscode.commands.registerTextEditorCommand('extension.superpresets', () => {
    superpowers.showPresets();
  });

  context.subscriptions.push(directInput);
  context.subscriptions.push(presets);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
