// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ViewColumn } from 'vscode';
import * as openssl from 'openssl-commander';
import { createHash } from 'crypto';

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

	/////////////////////////////////
	/////// OpenSSL Viewer //////////
	/////////////////////////////////
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('x509-parser', new OpenSSLOutputTextDocumentContentProvider()));
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
		pem = '-----BEGIN CERTIFICATE-----\n' + pem;
		if (pem.endsWith('\n')) {
			pem += '-----END CERTIFICATE-----';
		} else {
			pem += '\n-----END CERTIFICATE-----';
		}
	}
	let result = openssl.stdin(pem).cmd(command).exec();
	let output = result.stdout;
	if(result.status !== 0) {
		output = result.stderr;
	}

	const ranname = createHash('md5').update(output).digest("hex").substring(0, 6);
	const previewUri = vscode.Uri.parse(`x509-parser://viewer/OpenSSL%20Output%20${ranname}`);
	previewContents.set(previewUri.path, output);

	try{
		let doc = await vscode.workspace.openTextDocument(previewUri);
		await vscode.window.showTextDocument(doc, { preview: false, viewColumn: ViewColumn.Beside });
	} catch(e) {
		vscode.window.showErrorMessage(e);
		return;
	}
}

const previewContents = new Map();

export class OpenSSLOutputTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

	public provideTextDocumentContent(uri: vscode.Uri): string {
		const content = previewContents.get(uri.path);
		return content;		
	}

	get onDidChange(): vscode.Event<vscode.Uri> {
		return this._onDidChange.event;
	}

	public update(uri: vscode.Uri) {
		this._onDidChange.fire(uri);
	}
}