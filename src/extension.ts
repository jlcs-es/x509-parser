// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ViewColumn } from 'vscode';
import * as openssl from 'openssl-commander';
import { file } from 'tmp-promise';
const fs = require('fs').promises;


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	/////////////////////////////////
	////// x509 Parser //////////////
	/////////////////////////////////
	context.subscriptions.push(vscode.commands.registerCommand('extension.parseX509', async () => {
		await runAndShowOpenSSLCmd("x509 -text");
	}));
	/////////////////////////////////
	/////////////////////////////////

	/////////////////////////////////
	//////// CSR Parser /////////////
	/////////////////////////////////
	context.subscriptions.push(vscode.commands.registerCommand('extension.parseCSR', async () => {
		await runAndShowOpenSSLCmd("req -text");
	}));
	/////////////////////////////////
	/////////////////////////////////


	/////////////////////////////////
	/////// EC Key Parser ///////////
	/////////////////////////////////
	context.subscriptions.push(vscode.commands.registerCommand('extension.parseECkey', async () => {
		let password = await vscode.window.showInputBox({
			prompt: "Password for EC Private Key [ leave empty if none ]",
			password: true
		});
		if(!password)
			await runAndShowOpenSSLCmd("ec -text");
		else
			await runAndShowOpenSSLCmd(`ec -text -passin pass:${password}`);
	}));
	/////////////////////////////////
	/////////////////////////////////
}

// this method is called when your extension is deactivated
export function deactivate() { }


async function runAndShowOpenSSLCmd(command: string) {
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}
	let pem = editor.document.getText();
	// Check if the required PEM header and footer exist, if not assume the document contains a certificate
	if (!pem.startsWith('-----') && !pem.endsWith('-----')){
		pem = '-----BEGIN CERTIFICATE-----\n' + pem + '\n-----END CERTIFICATE-----';
	}
	let result = openssl.stdin(pem).cmd(command).exec();
	let output = result.stdout;
	if(result.status !== 0) {
		output = result.stderr;
	}
	try{
		let tmpfile = await file({
			keep: true,
			prefix: `${command.split(" ")[0]}-`,
			postfix: ".openssl"
		});
		await fs.writeFile(tmpfile.path, output);
		let doc = await vscode.workspace.openTextDocument(tmpfile.path);
		await vscode.window.showTextDocument(doc, { preview: false, viewColumn: ViewColumn.Beside });
	} catch(e) {
		vscode.window.showErrorMessage(e);
		return;
	}
}

