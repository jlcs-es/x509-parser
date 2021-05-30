import * as path from 'path';

import { runTests } from 'vscode-test';

async function go() {
	try {
		const extensionPath = path.resolve(__dirname, '../../../');
		const testRunnerPath = path.resolve(__dirname, './suite');

		/**
		 * Basic usage
		 */
		await runTests({
			extensionPath,
			testRunnerPath
		});

	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

go();