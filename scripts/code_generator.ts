///<reference path="token.ts" />
///<reference path="tree_node.ts" />
///<reference path="scope.ts" />

module Combobiler {
	export class CodeGenerator {
		// Define some default logger options for the Code Generator
		private loggerOptions = {
			type: 'code-generator',
			header: 'Code Generator',
		};

		private codeTable: Array<string>;
		// Set the expected size of the code table. This should match up with the
		// program size on the OS. Since MS-BOS has a default program size of 256,
		// we will match that for our compiler.
		private CODE_TABLE_SIZE = 256;

		constructor(private astRootNode: TreeNode) {

		}

		public performCodeGeneration() {
			try {
				this.log({
					standard: '==== Code Generator start ====',
					sarcastic: '==== Code Generator start ===='
				});
				if (this.astRootNode === null) {
					throw new Error('Null AST passed into code generator, can not start code generation');
				}
				this.log({
					standard: '==== Code Generator end ====',
					sarcastic: '==== Code Generator end ===='
				});
				return this.codeTable;
			} catch (error) {
				this.error({
					standard: error,
					sarcastic: error,
				});

				this.error({
					standard: '==== Code Generator ended due to error ====',
					sarcastic: '==== Code Generator ended due to error ===='
				});
				return;
			}
		}

		/**
		 * Internal handler for adding code to the table.
		 * Performs special checking to ensure code that is added is valid
		 *
		 * @param data the data (hex) to be added to the code table
		 * @param position the position (base-10, 0-indexed) in the codeTable to add the data to
		 */
		private addToCodeTable(data: string, position: number) {
			// Uppercase all the letters so that it's uniform regardless
			data.toUpperCase();

			if (!data.match(/^[0-9A-G]{2}/)) {
				throw new Error('Tried to place the data string ' + data + ' in code table, but it is not 2 valid hex characters');
			}
			if (position >= this.CODE_TABLE_SIZE || position < 0) {
				throw new Error('Position ' + position + ' is invalid for our code table');
			}
			this.codeTable[position] = data;
		}

		/**
		 * Internal handler for passing our log message to the logger. This method should
		 * be used for non-errors in the parser.
		 *
		 * @param message the text to be put into the output field
		 */
		private log(messages: Object) {
			LOGGER.log($.extend({displayClass: 'label-info'}, this.loggerOptions), messages);
		}

		/**
		 * Internal handler for passsing our error message to the logger. This method
		 * should be used for errors in the parser.
		 *
		 * @param message the text to be put into the output field
		 */
		private error(messages: Object) {
			LOGGER.log($.extend({displayClass: 'label-danger'}, this.loggerOptions), messages);
		}

		private warning(messages: Object) {
			LOGGER.log($.extend({displayClass: 'label-warning'}, this.loggerOptions), messages);
		}
	}
}
