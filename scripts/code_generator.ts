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

		public static operations = {
			'lda-const': 'A9',
			'lda-mem': 'AD',
			'sta': '8D',
			'adc': '6D',
			'ldx-const': 'A2',
			'ldx-mem': 'AE',
			'ldy-const': 'A0',
			'ldy-mem': 'AC',
			'nop': 'EA',
			'brk': '00',
			'cpx': 'EC',
			'bne': 'D0',
			'inc': 'EE',
			'sys': 'FF',
		};

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
			var value;
			if (typeof node.value === 'object') {
				value = node.value.value;
			} else {
				value = node.value;
			}
			if (value === 'Block') {
				this.generateBlock(node);
			} else if (value === 'WhileStatement') {
				this.generateWhileStatement(node);
			} else if (value === 'PrintStatement') {
				this.generatePrintStatement(node);
			} else if (value === 'VarDecl') {
				this.generateVarDecl(node);
			} else if (value === 'AssignmentStatement') {
				this.generateAssignmentStatement(node);
			} else if (value === 'IfStatement') {
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
			var type = node.children[0];
			if (type.value.value === 'StringExpression') {
				// 1. Put the String into the Heap
				var position = this.codeTable.addString(type.children[0].value);
				// 2. Load the accumulator with the address
				this.codeTable.addCode(CodeGenerator.operations['lda-const']);
				this.codeTable.addCode(position.toString(16));
				// 3. Set up registers to prepare for a system call
				this.codeTable.addCode(CodeGenerator.operations['sta']);
				this.codeTable.addCode('FF');
				this.codeTable.addCode('00');
				this.codeTable.addCode(CodeGenerator.operations['ldx-const']);
				this.codeTable.addCode('02');
				this.codeTable.addCode(CodeGenerator.operations['ldy-mem']);
				this.codeTable.addCode('FF');
				this.codeTable.addCode('00');
				this.codeTable.addCode(CodeGenerator.operations['sys']);
			} else if (type.value.value === 'IntExpression') {

			} else if (type.value.value === 'BooleanExpression') {

			} else if (type.value.value === 'Id') {

			} else {
				// Throw an error, although we should NEVER get here
				// since the front-end of the compiler should have done the checking
				throw new Error('Expected an expression in the Print Statement but got ' + type.value.value + ' instead');
			}

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
