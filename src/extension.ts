// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ViewColumn } from 'vscode';
import * as openssl from 'openssl-commander';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	/////////////////////////////////
	////// x509 Parser //////////////
	/////////////////////////////////
	context.subscriptions.push(vscode.commands.registerCommand('extension.parseX509', async () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		let result = openssl.stdin(editor.document.getText()).cmd("x509 -text").exec();
		let output = result.stdout;
		if(result.status !== 0) {
			output = result.stderr;
		}
		try{
			let doc = await vscode.workspace.openTextDocument({language: 'text', content: output});
			await vscode.window.showTextDocument(doc, { preview: false, viewColumn: ViewColumn.Beside });
		} catch(e) {
			return;
		}
	}));
	/////////////////////////////////
	/////////////////////////////////

	/////////////////////////////////
	//////// CSR Parser /////////////
	/////////////////////////////////
	context.subscriptions.push(vscode.commands.registerCommand('extension.parseCSR', async () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		let result = openssl.stdin(editor.document.getText()).cmd("req -text").exec();
		let output = result.stdout;
		if(result.status !== 0) {
			output = result.stderr;
		}
		try{
			let doc = await vscode.workspace.openTextDocument({language: 'text', content: output});
			await vscode.window.showTextDocument(doc, { preview: false, viewColumn: ViewColumn.Beside });
		} catch(e) {
			return;
		}
	}));
	/////////////////////////////////
	/////////////////////////////////
}

// this method is called when your extension is deactivated
export function deactivate() { }
