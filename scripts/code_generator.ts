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
				this.ldaConst(position.toString(16));
				// 3. Set up registers to prepare for a system call
				this.sta('FF', '00');
				this.ldxConst('02');
				this.ldyMem('FF', '00');
				this.sys();
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
			var varTypeNode = node.children[0];
			var varIdNode = node.children[1];

			if (varTypeNode.value.value.symbol === 'int') {
				this.generateIntVarDecl(varTypeNode, varIdNode);
			} else if (varTypeNode.value.value.symbol === 'string') {
				this.generateStringVarDecl(varTypeNode, varIdNode);
			} else if (varTypeNode.value.value.symbol === 'bool') {
				this.generateBoolVarDecl(varTypeNode, varIdNode);
			} else {
				throw new Error('Unknown type! How did you let this happen, front-end compiler!?');
			}
		}

		private generateIntVarDecl(varTypeNode: TreeNode, varIdNode: TreeNode) {
			// 1. Generate code to initialize our integers to 0
			this.ldaConst('00');
			// 2. Make an entry in the static table
			var tempId = this.staticTable.getNextTempId();
			this.staticTable.add(new StaticTableEntry(tempId, varIdNode.value.value.value, 0));
			// 3. Store the temp address in the code table
			this.sta(tempId, 'XX');
			this.log({
				standard: 'Generated code for int variable declaration',
				sarcastic: 'Generated code for int variable declaration',
			});
		}

		private generateStringVarDecl(varTypeNode: TreeNode, varIdNode: TreeNode) {
			this.log({
				standard: 'Generated code for string variable declaration',
				sarcastic: 'Generated code for string variable declaration',
			});
		}

		private generateBoolVarDecl(varTypeNode: TreeNode, varIdNode: TreeNode) {
			this.log({
				standard: 'Generated code for boolean variable declaration',
				sarcastic: 'Generated code for boolean variable declaration',
			});
		}

		private generateAssignmentStatement(node: TreeNode) {
			var varIdNode = node.children[0];
			var valueNode = node.children[1];

			if (valueNode.value.value === 'IntExpression') {
				this.generateIntAssignmentStatement(varIdNode, valueNode);
			} else if (valueNode.value.value === 'StringExpression') {
				this.generateStringAssignmentStatement(varIdNode, valueNode);
			} else if (valueNode.value.value === 'BooleanExpression') {
				this.generateBooleanAssignmentStatement(varIdNode, valueNode);
			} else {
				// We should never get here since the front-end of the compiler
				// should have taken care of these types of issues.
				// But, if we were to ever get in this situation, it's fair to
				// get angry and start yelling at the front-end compiler
				throw new Error('Front-end compiler, ARE YOU EVEN DOING YOUR JOB!?');
			}
		}

		private generateIntAssignmentStatement(varIdNode: TreeNode, valueNode: TreeNode) {
			// 1. Load the value into our accumulator
			this.ldaConst(this.leftPad(valueNode.children[0].value.value, 2));
			// 2. Store the accumulator into memory at the temp position
			var staticTableEntry = this.staticTable.findByVarId(varIdNode.value.value);
			this.sta(staticTableEntry.temp, 'XX');
			this.log({
				standard: 'Generated code for int assignment statement',
				sarcastic: 'Generated code for int assignment statement',
			});
		}

		private generateStringAssignmentStatement(varIdNode: TreeNode, valueNode: TreeNode) {
			this.log({
				standard: 'Generated code for string assignment statement',
				sarcastic: 'Generated code for string assignment statement',
			});
		}

		private generateBooleanAssignmentStatement(varIdNode: TreeNode, valueNode: TreeNode) {
			this.log({
				standard: 'Generated code for boolean assignment statement',
				sarcastic: 'Generated code for boolean assignment statement',
			});
		}

		private generateIfStatement(node: TreeNode) {
			this.log({
				standard: 'Generated code for if statement',
				sarcastic: 'Generated code for if statement',
			});
		}

		private ldaConst(byte1: string) {
			this.codeTable.addCode('A9');
			this.codeTable.addCode(byte1);
		}

		private ldaMem(byte1: string, byte2: string) {
			this.codeTable.addCode('AD');
			this.codeTable.addCode(byte1);
			this.codeTable.addCode(byte2);
		}

		private sta(byte1: string, byte2: string) {
			this.codeTable.addCode('8D');
			this.codeTable.addCode(byte1);
			this.codeTable.addCode(byte2);
		}

		private adc(byte1: string, byte2: string) {
			this.codeTable.addCode('6D');
			this.codeTable.addCode(byte1);
			this.codeTable.addCode(byte2);
		}

		private ldxConst(byte1: string) {
			this.codeTable.addCode('A2');
			this.codeTable.addCode(byte1);
		}

		private ldxMem(byte1: string, byte2: string) {
			this.codeTable.addCode('01');
			this.codeTable.addCode(byte1);
			this.codeTable.addCode(byte2);
		}

		private ldyConst(byte1: string) {
			this.codeTable.addCode('A0');
			this.codeTable.addCode(byte1);
		}

		private ldyMem(byte1: string, byte2: string) {
			this.codeTable.addCode('AC');
			this.codeTable.addCode(byte1);
			this.codeTable.addCode(byte2);
		}

		private nop() {
			this.codeTable.addCode('EA');
		}

		private break() {
			this.codeTable.addCode('00');
		}

		private cpx(byte1: string, byte2: string) {
			this.codeTable.addCode('EC');
			this.codeTable.addCode(byte1);
			this.codeTable.addCode(byte2);
		}

		private bne(byte1: string) {
			this.codeTable.addCode('F0');
			this.codeTable.addCode(byte1);
		}

		private inc(byte1: string, byte2: string) {
			this.codeTable.addCode('EE');
			this.codeTable.addCode(byte1);
			this.codeTable.addCode(byte2);
		}

		private sys() {
			this.codeTable.addCode('FF');
		}

		private leftPad(data: string, length: number) {
			var temp = '' + data;
			while (temp.length < length) {
				temp = '0' + temp;
			}
			return temp;
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
