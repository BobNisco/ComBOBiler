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

		private codeTable: CodeTable;

		private staticTable: StaticTable;

		private jumpTable: JumpTable;

		constructor(private astRootNode: TreeNode) {
			this.codeTable = new CodeTable();
			this.staticTable = new StaticTable();
			this.jumpTable = new JumpTable();
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
				this.generateCodeForNode(this.astRootNode);
				this.codeTable.finalizeCodeTable();
				this.log({
					standard: '==== Code Generator end ====',
					sarcastic: '==== Code Generator end ===='
				});
				return this.codeTable.createStringForDisplay();
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

		private generateCodeForNode(node: TreeNode) {
			if (node.value === 'Block') {
				this.generateBlock(node);
			} else if (node.value === 'WhileStatement') {
				this.generateWhileStatement(node);
			} else if (node.value === 'PrintStatement') {
				this.generatePrintStatement(node);
			} else if (node.value === 'VarDecl') {
				this.generateVarDecl(node);
			} else if (node.value === 'AssignmentStatement') {
				this.generateAssignmentStatement(node);
			} else if (node.value === 'IfStatement') {
				this.generateIfStatement(node);
			}
		}

		private generateWhileStatement(node: TreeNode) {
			this.log({
				standard: 'Generated code for While Statement',
				sarcastic: 'Generated code for While Statement',
			});
		}

		private generateBlock(node: TreeNode) {
			for (var child in node.children) {
				this.generateCodeForNode(node.children[child]);
			}
			this.log({
				standard: 'Generated code for block',
				sarcastic: 'Generated code for block',
			});
		}

		private generatePrintStatement(node: TreeNode) {
			this.log({
				standard: 'Generated code for print statement',
				sarcastic: 'Generated code for print statement',
			});
		}

		private generateVarDecl(node: TreeNode) {
			this.log({
				standard: 'Generated code for variable declaration',
				sarcastic: 'Generated code for variable declaration',
			});
		}

		private generateAssignmentStatement(node: TreeNode) {
			this.log({
				standard: 'Generated code for assignment statement',
				sarcastic: 'Generated code for assignment statement',
			});
		}

		private generateIfStatement(node: TreeNode) {
			this.log({
				standard: 'Generated code for if statement',
				sarcastic: 'Generated code for if statement',
			});
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
