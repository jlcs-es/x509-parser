// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ViewColumn } from 'vscode';
import * as openssl from 'openssl-commander';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const x509PEMProvider = new class implements vscode.TextDocumentContentProvider {

		// emitter and its event
		onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
		onDidChange = this.onDidChangeEmitter.event;

		provideTextDocumentContent(uri: vscode.Uri): string {
			let result = openssl.stdin(decodeURIComponent(uri.path)).cmd("x509 -text").exec();
			if(result.status !== 0) {
				return result.stderr;
			} else {
				return result.stdout;
			}
		}
	};
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider("x509PEM", x509PEMProvider));

	context.subscriptions.push(vscode.commands.registerCommand('extension.parsePEM', async () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		let document = editor.document;
		let uri = vscode.Uri.parse('x509PEM:' + document.getText());
		try{
			let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
			doc = await vscode.workspace.openTextDocument({language: 'text', content: doc.getText()});
			await vscode.window.showTextDocument(doc, { preview: false, viewColumn: ViewColumn.Beside });
		} catch(e) {
			return;
		}
	}));
}

// this method is called when your extension is deactivated
export function deactivate() { }
