const vscode = require('vscode');

class Superpowers {
  constructor(options) {
    const defaults = {
      lastMapString: '(value, index, array) => value',
      lastSortString: '(a, b) => a - b',
      mapPresets: {},
      sortPresets: {},
      completions: [{
        name: 'roundedTime',
        selectors: ['markdown', 'plaintext'],
        triggers: ['R', 'T'],
        completionFunction: ( document, position, token ) => {
          const lineText = document.lineAt(position).text;
          const matcher = /^\s*(\d{2}:\d{2})?([\s-]+)?([RT]{1,2})?$/;
          const matchResult = lineText.match(matcher);

          if(matchResult === null) {
            // edit operation is not interesting, let's bail...
            token.cancel();
            return false;
          }

          console.log(JSON.stringify(matchResult, ' ', 2));

          let textPrefix = '';
          let textSuffix = ' - ';
          if(matchResult[1]) { // is there already a time on this row?
            textSuffix = ' ';
            if(matchResult[2] === ' ') {
              textPrefix = '- ';
            } else if(matchResult[2] === ' -') {
              textPrefix = ' ';
            }
          }

          let timeFunction = () => {
            let now = new Date( Math.round(Date.now() / 1000 / 60 / 15) * 1000 * 60 * 15 );
            return now.getHours() + ':' + ('0' + now.getMinutes()).substr(-2);
          };

          const time = timeFunction();
          const completion = new vscode.CompletionItem('RT');
          completion.kind = vscode.CompletionItemKind.Keyword;
          completion.documentation = time;
          completion.insertText = textPrefix + time + textSuffix;

          return [ completion ];
        }
      }, {
        name: 'timeDeltas',
        selectors: ['markdown', 'plaintext'],
        triggers: ['T', 'D'],
        completionFunction: (document, position, context) => {
          const lineText = document.lineAt(position).text;
          const matcher = /^\s*(\d{2}:\d{2})([\s-]+)?(\d{2}:\d{2})\s*([TD]{1,2})?/;
          const matchResult = lineText.match(matcher);

          if(!matchResult) {
            // edit operation is not interesting, let's bail...
            context.cancel();
            return false;
          }

          const getTimeDelta = (v) => {
            var times = v.match(/[0-9]+:[0-9]+/g).map(t => { let parts = t.split(':'); return parseInt(parts[0]) + (parts[1] / 60) }); return '(' + Math.abs(times[1] - times[0]) + 'h)';
          }

          const completion = new vscode.CompletionItem('TD');
          completion.kind = vscode.CompletionItemKind.Keyword;
          completion.documentation = 'Calculates deltas between times, given in format HH:MM - HH:MM';
          completion.insertText = getTimeDelta(lineText);

          return [ completion ];
        }
      }]
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

  showReduceInput(validate = true) {
    vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHodler: this.lastReduceString,
      value: this.lastReduceString,
      prompt: 'Go nuts!',
      validateInput: validate ? this._validateReduceInput.bind(this) : () => {}
    }).then(this._processReduceInput.bind(this));
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
    return this._validateInput(input, 'map', 'Map preview');
  }

  _validateSortInput(input) {
    return this._validateInput(input, 'sort', 'Sort preview');
  }

  _validateReduceInput(input) {
    return this._validateInput(input, 'reduce', 'Reduce preview');
  }

  _validateInput(input, arrayMethod, label, initialize) {
    try {
      const userFn = eval(input);
      const selections = this._getSelections();
      const texts = this._selectionsToText(selections);
      const result = typeof initialize !== 'undefined'
        ? texts[arrayMethod](userFn, initialize)
        : texts[arrayMethod](userFn);
      if(Array.isArray(result)) {
        vscode.window.showInformationMessage(
          label,
          ...result.map(String).slice(0, 3)
        );
      } else {
        vscode.window.showInformationMessage(
          label, String(result)
        );
      }
      vscode.window.setStatusBarMessage(arrayMethod, 500);
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
    this._processInput(input, 'map');
  }
  _processSortInput(input) {
    this._processInput(input, 'sort');
  }
  _processReduceInput(input) {
    this._processInput(input, 'reduce', {});
  }

  _processInput(input, arrayMethod, initialize) {
    const userFn = eval(input);
    const selections = this._getSelections();
    const texts = this._selectionsToText(selections);
    const result = typeof initialize !== 'undefined'
      ? texts[arrayMethod](userFn, null)
      : texts[arrayMethod](userFn);

    if(Array.isArray(result) && selections.length === result.length) {
      vscode.window.activeTextEditor.edit((builder) => {
        selections.forEach((selection, index) => {
          builder.replace(selection, String(result[index]));
        })
      })
    } else {
      // Result and selections counts don't match,
      // append result after last selection
      vscode.window.activeTextEditor.edit((builder) => {
        builder.insert(vscode.window.activeTextEditor.selection.end, String(result));
      });
    }

    this[`last${ arrayMethod[0].toUpperCase() + arrayMethod.slice(1) }String`] = input;
  }
/*
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
*/
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
  let reduceInput = vscode.commands.registerTextEditorCommand('superpowers.customReduce', () => {
    superpowers.showReduceInput();
  });
  let mapPresets = vscode.commands.registerTextEditorCommand('superpowers.mapPresets', () => {
    superpowers.showMapPresets();
  });
  let sortPresets = vscode.commands.registerTextEditorCommand('superpowers.sortPresets', () => {
    superpowers.showSortPresets();
  });

  context.subscriptions.push(mapInput);
  context.subscriptions.push(sortInput);
  context.subscriptions.push(reduceInput);
  context.subscriptions.push(mapPresets);
  context.subscriptions.push(sortPresets);

  // Completion providers

  superpowers.completions.forEach(completion => {
    completion.selectors.forEach(selector => {
      let currentProvider = vscode.languages.registerCompletionItemProvider(
        selector,
        { provideCompletionItems: completion.completionFunction },
        completion.triggers
      );

      context.subscriptions.push(currentProvider);
    })
  })

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
