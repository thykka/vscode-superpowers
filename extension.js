console.clear();
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

class Superpowers {
  constructor(options) {
    const defaults = {
      execString: '(v) => v'
    };

    Object.assign(this, defaults, options);
  }

  showInput() {
    vscode.window.showInputBox({
      placeHolder: this.execString,
      value: this.execString,
      prompt: 'Go nuts!',
      validateInput: this._validateInput.bind(this)
    }).then(this._processInput);
  }

  _validateInput(input) {
    try {
      let execFn = eval(input);
      let selections = this._getSelections();
      vscode.window.showInformationMessage(
        execFn(selections[0], 0, [selections[0]])
      );
    } catch(e) {
      return e.toString();
    }
    return '';
  }

  _getSelections() {
    const selections = vscode.window.activeTextEditor.selections || [];
    return selections.map(
      selection => vscode.window.activeTextEditor.document.getText(selection)
    );
  }

  _processInput(input) {
    const editor = vscode.window.activeTextEditor;
    const selections = editor.selections;
    const document = editor.document;
    const execFn = eval(input);

    const results = selections.map(
      selection => document.getText(selection)
    ).map(execFn).map(String);

    editor.edit((builder) => {
      selections.forEach((selection, index) => {
        builder.replace(selection, results[index]);
      });
    });
  }
}

const superpowers = new Superpowers();

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('extension.superpowers', () => {
    superpowers.showInput();
  });

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
