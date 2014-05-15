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

		private currentBlock: number;

		constructor(private astRootNode: TreeNode, private rootScope: Scope) {
			this.codeTable = new CodeTable();
			this.staticTable = new StaticTable();
			this.jumpTable = new JumpTable();
			this.currentBlock = 0;
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
				this.generateCodeForNode(this.astRootNode, this.rootScope);
				// Manually put a break in for the end of code just to be safe
				this.break();
				this.codeTable.finalizeCodeTable();
				this.jumpTable.backpatch(this.codeTable);
				this.staticTable.backpatch(this.codeTable);
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

		private generateCodeForNode(node: TreeNode, scope: Scope) {
			var value = this.determineTypeOfNode(node);
			if (value === 'Block') {
				this.generateBlock(node, scope);
			} else if (value === 'WhileStatement') {
				this.generateWhileStatement(node, scope);
			} else if (value === 'PrintStatement') {
				this.generatePrintStatement(node, scope);
			} else if (value === 'VarDecl') {
				this.generateVarDecl(node, scope);
			} else if (value === 'AssignmentStatement') {
				this.generateAssignmentStatement(node, scope);
			} else if (value === 'IfStatement') {
				this.generateIfStatement(node, scope);
			}
		}

		private determineTypeOfNode(node: TreeNode) {
			var value;
			if (typeof node.value === 'object') {
				value = node.value.value;
			} else {
				value = node.value;
			}
			return value;
		}

		private generateWhileStatement(node: TreeNode, scope: Scope) {
			// 1. Get our current address
			var startAddress = this.codeTable.currentPosition;
			// 2. Generate the boolean expression
			this.generateBooleanExpression(node.children[0], scope);
			// 3. Set up the jump entry
			var jumpTempId = this.jumpTable.getNextTempId();
			var jumpEntry = this.jumpTable.add(new JumpTableEntry(jumpTempId, 0));
			// 4. Handle the block
			this.generateBlock(node.children[1], scope);
			// 5. Unconditional jump
			this.ldaConst('00');
			this.sta('00', '00');
			this.ldxConst('01');
			this.cpx('00', '00');
			this.bne(CodeGenerator.leftPad((CodeTable.CODE_TABLE_SIZE - (this.codeTable.currentPosition - startAddress + 2)).toString(16), 2));
			// 6. Jump address
			jumpEntry.distance = this.codeTable.currentPosition - startAddress + 1;
			this.log({
				standard: 'Generated code for While Statement',
				sarcastic: 'Generated code for While Statement',
			});
		}

		private generateBlock(node: TreeNode, scope: Scope) {
			this.currentBlock++;
			scope = this.findScopeByCurrentId();
			for (var i = 0; i < node.children.length; i++) {
				this.generateCodeForNode(node.children[i], scope);
			}
			this.currentBlock = scope.parent.id;
			scope = this.findScopeByCurrentId();
			this.log({
				standard: 'Generated code for block',
				sarcastic: 'Generated code for block',
			});
		}

		private generatePrintStatement(node: TreeNode, scope: Scope) {
			var type = node.children[0];
			if (type.value.value === 'StringExpression') {
				// 1. Put the String into the Heap
				var position = this.codeTable.addString(type.children[0].value);
				// 2. Load the accumulator with the address
				this.ldaConst(position.toString(16));
				this.sta('00', '00');
				// 3. Set up registers to prepare for a system call
				this.ldxConst('02');
				this.ldyMem('00', '00');
				this.sys();
			} else if (type.value.value === 'IntExpression') {
				this.generateIntExpression(node.children[0], scope);
				this.sta('00', '00');
				this.ldxConst('01');
				this.ldyMem('00', '00');
				this.sys();
			} else if (type.value.value === 'BooleanExpression') {
				var boolVal = type.children[0].value.value.symbol;
				var location;
				var stringInHeap = this.codeTable.findStringInHeap(boolVal);
				if (stringInHeap === null) {
					location = this.codeTable.addRawString(boolVal);
				} else {
					location = stringInHeap;
				}
				this.ldaConst(location.toString(16));
				this.sta('00', '00');
				this.ldxConst('02');
				this.ldyMem('00', '00');
				this.sys();
			} else if (type.value.value === 'Id') {
				// 1. Find the variable we'll be printing
				var varIdStaticTableEntry = this.staticTable.findByVarIdAndScope(type.children[0].value.value, scope);
				// 2. Load the Y register with contents of the variable
				this.ldyMem(varIdStaticTableEntry.temp, 'XX');
				// 3. Load the X register with a value based on type of Id
				if (Scope.findSymbolInScope(type.children[0].value.value, scope).type === 'int') {
					this.ldxConst('01');
				} else {
					this.ldxConst('02');
				}
				// 4. System call
				this.sys();
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

		private generateVarDecl(node: TreeNode, scope: Scope) {
			var varTypeNode = node.children[0];
			var varIdNode = node.children[1];

			if (varTypeNode.value.value.symbol === 'int') {
				this.generateIntVarDecl(varTypeNode, varIdNode, scope);
			} else if (varTypeNode.value.value.symbol === 'string') {
				this.generateStringVarDecl(varTypeNode, varIdNode, scope);
			} else if (varTypeNode.value.value.symbol === 'bool') {
				this.generateBoolVarDecl(varTypeNode, varIdNode, scope);
			} else {
				throw new Error('Unknown type! How did you let this happen, front-end compiler!?');
			}
		}

		private generateIntVarDecl(varTypeNode: TreeNode, varIdNode: TreeNode, scope: Scope) {
			// 1. Generate code to initialize our integers to 0
			this.ldaConst('00');
			// 2. Make an entry in the static table
			var tempId = this.staticTable.getNextTempId();
			this.staticTable.add(new StaticTableEntry(tempId, varIdNode.value.value.value, this.staticTable.getNextOffsetNumber(), scope));
			// 3. Store the temp address in the code table
			this.sta(tempId, 'XX');
			this.log({
				standard: 'Generated code for int variable declaration',
				sarcastic: 'Generated code for int variable declaration',
			});
		}

		private generateStringVarDecl(varTypeNode: TreeNode, varIdNode: TreeNode, scope: Scope) {
			var tempId = this.staticTable.getNextTempId();
			this.staticTable.add(new StaticTableEntry(tempId, varIdNode.value.value.value, this.staticTable.getNextOffsetNumber(), scope));
			this.log({
				standard: 'Generated code for string variable declaration',
				sarcastic: 'Generated code for string variable declaration',
			});
		}

		private generateBoolVarDecl(varTypeNode: TreeNode, varIdNode: TreeNode, scope: Scope) {
			this.log({
				standard: 'Generated code for boolean variable declaration',
				sarcastic: 'Generated code for boolean variable declaration',
			});
		}

		private generateAssignmentStatement(node: TreeNode, scope: Scope) {
			var varIdNode = node.children[0];
			var valueNode = node.children[1];

			if (valueNode.value.value === 'IntExpression') {
				this.generateIntAssignmentStatement(varIdNode, valueNode, scope);
			} else if (valueNode.value.value === 'StringExpression') {
				this.generateStringAssignmentStatement(varIdNode, valueNode, scope);
			} else if (valueNode.value.value === 'BooleanExpression') {
				this.generateBooleanAssignmentStatement(varIdNode, valueNode, scope);
			} else if (valueNode.value.value === 'Id') {
				this.generateIdAssignmentStatement(varIdNode, valueNode, scope);
			} else {
				// We should never get here since the front-end of the compiler
				// should have taken care of these types of issues.
				// But, if we were to ever get in this situation, it's fair to
				// get angry and start yelling at the front-end compiler
				throw new Error('Front-end compiler, ARE YOU EVEN DOING YOUR JOB!?');
			}
		}

		private generateIntAssignmentStatement(varIdNode: TreeNode, valueNode: TreeNode, scope: Scope) {
			// 1. Handle any addition that may need to be done
			//    and the result will be in the accumulator
			this.generateIntExpression(valueNode, scope);
			// 2. Store the accumulator into memory at the temp position
			var staticTableEntry = this.staticTable.findByVarIdAndScope(varIdNode.value.value, scope);
			this.sta(staticTableEntry.temp, 'XX');
			this.log({
				standard: 'Generated code for int assignment statement',
				sarcastic: 'Generated code for int assignment statement',
			});
		}

		private generateIntExpression(node: TreeNode, scope: Scope) {
			if (node.value.value === '+') {
				this.generateIntExpression(node.children[0], scope);
			} else if (node.value.value === '-') {
				throw new Error('The minus operator is not supported at this time.');
			} else if (node.children.length == 1) {
				// We have a single number, put that into the accumulator
				this.ldaConst(CodeGenerator.leftPad(node.children[0].value.value, 2));
			} else {
				// We have an expression we need to evaluate
				// Put the first number into accumulator
				this.ldaConst(CodeGenerator.leftPad(node.children[0].value.value, 2));
				// And store it in location 00
				this.sta('00', '00');
				// Recurse down
				this.generateIntExpression(node.children[1], scope);
				this.adc('00', '00');
			}
		}

		private generateStringAssignmentStatement(varIdNode: TreeNode, valueNode: TreeNode, scope: Scope) {
			// 1. Put the string into the heap
			var position = this.codeTable.addString(valueNode.children[0].value);
			// 2. Load the accumulator with the address of the string
			this.ldaConst(CodeGenerator.leftPad(position.toString(16), 2));
			// 3. Store the accumulator into memory at the temp position
			var staticTableEntry = this.staticTable.findByVarIdAndScope(varIdNode.value.value, scope);
			this.sta(staticTableEntry.temp, 'XX');
			this.log({
				standard: 'Generated code for string assignment statement',
				sarcastic: 'Generated code for string assignment statement',
			});
		}

		private generateBooleanAssignmentStatement(varIdNode: TreeNode, valueNode: TreeNode, scope: Scope) {
			this.log({
				standard: 'Generated code for boolean assignment statement',
				sarcastic: 'Generated code for boolean assignment statement',
			});
		}

		private generateIdAssignmentStatement(varIdNode: TreeNode, valueNode: TreeNode, scope: Scope) {
			// 1. Find the variable we are setting it to in the static table
			var valueStaticTableEntry = this.staticTable.findByVarIdAndScope(valueNode.children[0].value.value, scope);
			// 2. Load the pointer into accumulator
			this.ldaMem(valueStaticTableEntry.temp, 'XX');
			// 3. Find the variable in the static table
			var varIdStaticTableEntry = this.staticTable.findByVarIdAndScope(varIdNode.value.value, scope);
			// 4. Store what's in the accumulator into memory
			this.sta(varIdStaticTableEntry.temp, 'XX');
			this.log({
				standard: 'Generated code for id assignment statement',
				sarcastic: 'Generated code for id assignment statement',
			});
		}

		private generateIfStatement(node: TreeNode, scope: Scope) {
			// Don't even bother generating code if we're going to compare on false
			if (node.children[0].value.value.symbol === "false") {
				return;
			}
			// 1. Set up a jump entry
			var jumpTempId = this.jumpTable.getNextTempId();
			var jumpEntry = this.jumpTable.add(new JumpTableEntry(jumpTempId, 0));
			// 2. The boolean expression of the if statement
			this.generateBooleanExpression(node.children[0], scope);
			var startOfJump = this.codeTable.currentPosition;
			// 3. Put in the jump statement
			this.bne(jumpEntry.temp);
			// 4. Generate code for the block
			this.generateBlock(node.children[1], scope);
			// 5. Calculate the jump distance
			//    Add one due to the way jumps are handled
			jumpEntry.distance = this.codeTable.currentPosition - startOfJump + 1;
			this.log({
				standard: 'Generated code for if statement',
				sarcastic: 'Generated code for if statement',
			});
		}

		private generateBooleanExpression(node: TreeNode, scope: Scope) {
			// Writing an if statement to check equality of equality statements, so meta
			if (node.value.value.symbol === "==") {
				this.generateEqual(node, scope);
			} else if (node.value.value.symbol === "!=") {

			} else if (node.value.value.symbol === "true") {

			} else if (node.value.value.symbol === "false") {

			} else {
				// We should never get here if the front-end compiler is working properly!
				throw new Error('Malformed if statement');
			}
		}

		private getNextSiblingScope(scope: Scope) {
			for (var i = 0; i < scope.parent.children.length; i++) {
				if (scope.parent.children[i] === scope) {
					if (scope.parent.children[i + 1] != null) {
						return scope.parent.children[i + 1];
					}
				}
			}
			return null;
		}

		private generateEqual(node: TreeNode, scope: Scope) {
			// 0. We're not handling nested comparison right now
			this.checkForNestedComparison(node.children[1], scope);
			// 1. Determine left side values
			//    and put those values into the X register
			var leftSideValue = this.determineTypeOfNode(node.children[0]);
			var valueForX;
			if (leftSideValue === 'Id') {
				var idStaticTableEntry = this.staticTable.findByVarIdAndScope(node.children[0].children[0].value.value, scope);
				this.ldxMem(idStaticTableEntry.temp, 'XX');
			} else if (leftSideValue === 'IntExpression') {
				this.ldxConst(CodeGenerator.leftPad(node.children[0].children[0].value.value, 2));
			} else if (leftSideValue === 'BooleanExpression') {
				if (node.children[0].value.value === 'true') {
					this.ldxConst('01');
				} else {
					this.ldxConst('00');
				}
			} else if (leftSideValue === 'StringExpression') {
				// TODO: Figure out WTF to do here
			}

			// 2. Determine right side values
			//    and either compare their memory location with X
			//    or put their value at 00 and compare with X
			var rightSideValue = this.determineTypeOfNode(node.children[1]);
			if (rightSideValue === 'Id') {
				var idStaticTableEntry = this.staticTable.findByVarIdAndScope(node.children[1].children[0].value.value, scope);
				this.cpx(idStaticTableEntry.temp, '00');
			} else if (rightSideValue === 'IntExpression') {
				this.ldaConst(CodeGenerator.leftPad(node.children[1].children[0].value.value.toString(16), 2));
				// Store the value at 00
				this.sta('00', '00');
				// Compare
				this.cpx('00', '00');
			} else if (rightSideValue === 'BooleanExpression') {
				if (node.children[0].value.value === 'true') {
					this.ldaConst('01');
				} else {
					this.ldaConst('00');
				}
				this.sta('00', '00');
				this.cpx('00', '00');
			} else if (rightSideValue === 'StringExpression') {
				// TODO: Figure out WTF to do here
			}
		}

		private checkForNestedComparison(node: TreeNode, scope: Scope) {
			// TODO: Make nested equality work
			//       but for now, throw an error
			for (var i = 0; i < node.children.length; i++) {
				var value = this.determineTypeOfNode(node.children[i]);
				if (value === "==" || value === "!=") {
					throw new Error('Sorry, right now ComBOBiler can not generate code for nested if statements. If you would like to purchase him a beverage, he will consider adding in support.');
				}
			}
		}

		private findScopeByCurrentId() {
			return this.findScopeByIdHandler(this.rootScope);
		}

		private findScopeByIdHandler(scope: Scope) {
			if (scope.id === this.currentBlock) {
				return scope;
			}
			for (var i = 0; i < scope.children.length; i++) {
				return this.findScopeByIdHandler(scope.children[i]);
			}
			return null;
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
			this.codeTable.addCode('AE');
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
			this.codeTable.addCode('D0');
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

		public leftPad(data: string, length: number) {
			CodeGenerator.leftPad(data, length);
		}

		public static leftPad(data: string, length: number) {
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
