///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />

module Combobiler {
	export class SemanticAnalyzer {
		// Define some default logger options for the Semantic Analyzer
		private loggerOptions = {
			type: 'semantic-analyzer',
			header: 'Semantic Analysis',
		};

		private currentNode: TreeNode;

		private astRootNode: TreeNode;

		constructor(private rootNode: TreeNode, private rootScope: Scope) {
			this.currentNode = this.rootNode;
		}

		public performSemanticAnalysis() {
			this.log({
				standard: '==== Semantic Analysis start ====',
				sarcastic: '==== Semantic Analysis start ===='
			});
			try {
				// Refactoring the way we handle scope
				this.rootScope = new Scope({}, null);

				this.analyzeProgram(this.rootNode, this.rootScope, this.astRootNode);
				console.log(this.rootScope);
				this.drawTree(this.astRootNode, 'ast-tree-graph');
				this.drawTree(this.rootNode, 'cst-tree-graph');
				this.log({
					standard: '==== Semantic Analysis end ====',
					sarcastic: '==== Semantic Analysis end ===='
				});
				console.log(this.astRootNode);
				console.log(this.rootNode);
				return this.astRootNode;
			} catch (error) {
				console.log(this.rootScope);
				this.error({
					standard: error,
					sarcastic: error,
				});

				this.error({
					standard: '==== Semantic Analysis ended due to error ====',
					sarcastic: '==== Semantic Analysis ended due to error ===='
				});
			}
		}

		private analyzeProgram(node: TreeNode, scope: Scope, astNode: TreeNode) {
			this.analyzeBlock(node.children[0], scope, astNode);
		}

		private analyzeBlock(node: TreeNode, scope: Scope, astNode: TreeNode) {
			if (this.astRootNode == undefined) {
				this.astRootNode = new TreeNode('Block', null);
				astNode = this.astRootNode;
			} else {
				astNode.addChildNode(new TreeNode('Block', astNode));
				astNode = astNode.getNewestChild();
			}
			// Since a block indicates a new Scope, we'll open a new one up
			scope.addChildScope({});
			scope = scope.getNewestChild();
			this.analyzeStatementList(node.children[1], scope, astNode);
			// Before this function breaks out of recursion,
			// we'll check for some unused identifiers
			if (scope.hasUnusedIdentifiers()) {
				var list = scope.unusedIdentifierList();
				for (var i in list) {
					// TODO: Add a warning function to the logger
					this.log({
						standard: 'Check yo self! You never used variable with identifier ' + i,
						sarcastic: 'Quit wasting my space with your unused identifier ' + i,
					});
				}
			}
		}

		private analyzeStatementList(node: TreeNode, scope: Scope, astNode: TreeNode) {
			if (!node) {
				// Epsilon production
				return;
			}
			if (node.children.length > 0) {
				this.analyzeStatement(node.children[0], scope, astNode);
				this.analyzeStatementList(node.children[1], scope, astNode);
			}
		}

		private analyzeStatement(node: TreeNode, scope: Scope, astNode: TreeNode) {
			if (node.value === 'PrintStatement') {
				this.analyzePrintStatement(node, scope, astNode);
			} else if (node.value === 'AssignmentStatement') {
				this.analyzeAssignmentStatement(node, scope, astNode);
			} else if (node.value === 'VarDecl') {
				this.analyzeVarDecl(node, scope, astNode);
			} else if (node.value === 'WhileStatement') {
				this.analyzeWhileStatement(node, scope, astNode);
			} else if (node.value === 'IfStatement') {
				this.analyzeIfStatement(node, scope, astNode);
			} else if (node.value === 'Block') {
				this.analyzeBlock(node, scope, astNode);
			} else {
				// TODO: Handle error
			}
		}

		private analyzeWhileStatement(node: TreeNode, scope: Scope, astNode: TreeNode) {
			// Add this node to the AST
			astNode.addChildNode(new TreeNode('WhileStatement', astNode));
			astNode = astNode.getNewestChild();

			this.analyzeBooleanExpression(node.children[1], scope, astNode);
			this.analyzeBlock(node.children[2], scope, astNode);
		}

		private analyzeAssignmentStatement(node: TreeNode, scope: Scope, astNode: TreeNode) {
			var currentId = node.children[0].value.value;
			this.assignValue(node, scope, astNode, currentId);
			var scopeNode = Scope.findSymbolInScope(currentId, scope);

			astNode.addChildNode(new TreeNode('AssignmentStatement', astNode));
			astNode = astNode.getNewestChild();

			if (scopeNode.type === 'int') {
				// Create a test variable that we know is of type number
				var numberTestType: number = 1;
				// Assert that the type is a number, since this is a statically typed language
				this.assertType(scopeNode.value, numberTestType);
			} else if (scopeNode.type === 'string') {
				// Create a test variable that we know is of type String
				var stringTestType: string = 'test';
				// Assert that the type is a string, since this is a statically typed language
				this.assertType(scopeNode.value, stringTestType);
			} else if (scopeNode.type === 'boolean') {
				// Create a test variable that we know is of type boolean
				var booleanTestType: boolean = true;
				// Assert that the type is a boolean, since this is a statically typed language
				this.assertType(scopeNode.value, booleanTestType);
			} else {
				console.log(scopeNode);
				this.error({
					standard: 'Unknown type!',
					sarcastic: 'Unknown type!',
				});
			}

			// Add the type and the value to the AST
			astNode.addChildNode(new TreeNode(currentId, astNode));
			this.analyzeExpression(node.children[2], scope, astNode);

			this.log({
				standard: 'VarId ' + currentId + ' was assigned a value with expected type ' + scopeNode.type,
				sarcastic: 'VarId ' + currentId + ' was assigned a value with expected type ' + scopeNode.type,
			});
		}

		private assignValue(node: TreeNode, scope: Scope, astNode: TreeNode, currentId) {
			var exprType = node.children[2].children[0].value;
			var potentialValue = node.children[2].children[0].children[0].value.value;
			if (exprType === 'IntExpression') {
				scope.assignValue(currentId, parseInt(potentialValue));
			} else if (exprType === 'BooleanExpression') {
				scope.assignValue(currentId, !!potentialValue);
			} else if (exprType === 'StringExpression') {
				scope.assignValue(currentId, potentialValue);
			} else {
				throw new Error('Unknown value type');
			}
		}

		private analyzeVarDecl(node: TreeNode, scope: Scope, astNode: TreeNode) {
			astNode.addChildNode(new TreeNode('VarDecl', astNode));
			astNode = astNode.getNewestChild();

			// Add this to the current scope
			scope.addSymbol(node.children[2].value.value, new ScopeNode(null, node.children[0].value.symbol));

			astNode.addChildNode(new TreeNode(node.children[0].value, astNode));
			astNode.addChildNode(new TreeNode(node.children[2].value, astNode));
		}

		private analyzeIfStatement(node: TreeNode, scope: Scope, astNode: TreeNode) {
			astNode.addChildNode(new TreeNode(node.value, astNode));
			astNode = astNode.getNewestChild();

			this.analyzeBooleanExpression(node.children[1], scope, astNode);
			this.analyzeBlock(node.children[2], scope, astNode);
		}

		private analyzePrintStatement(node: TreeNode, scope: Scope, astNode: TreeNode) {
			astNode.addChildNode(new TreeNode('PrintStatement', astNode));
			astNode = astNode.getNewestChild();

			this.analyzeExpression(node.children[2], scope, astNode);
		}

		private analyzeExpression(node: TreeNode, scope: Scope, astNode: TreeNode) {
			if (node.children[0].value === 'IntExpression') {
				this.analyzeIntExpression(node.children[0], scope, astNode);
			} else if (node.children[0].value === 'StringExpression') {
				this.analyzeStringExpression(node.children[0], scope, astNode);
			} else if (node.children[0].value === 'BooleanExpression') {
				this.analyzeBooleanExpression(node.children[0], scope, astNode);
			} else if (node.children[0].value === 'Id') {
				this.analyzeId(node.children[0], scope, astNode);
			}
		}

		private analyzeId(node: TreeNode, scope: Scope, astNode: TreeNode) {
			astNode.addChildNode(new TreeNode(node.children[0].value.value, astNode));
		}

		private analyzeStringExpression(node: TreeNode, scope: Scope, astNode: TreeNode) {
			astNode.addChildNode(new TreeNode(node.children[0].value, astNode));
		}

		private analyzeIntExpression(node: TreeNode, scope: Scope, astNode: TreeNode) {
			astNode.addChildNode(new TreeNode(node.children[0].value.value, astNode));
			if (node.children.length === 3) {
				astNode.addChildNode(new TreeNode('+', astNode));
				this.analyzeExpression(node.children[2], scope, astNode);
			}
		}

		private analyzeBooleanExpression(node: TreeNode, scope: Scope, astNode: TreeNode) {
			if (node.children.length === 1) {
				astNode.addChildNode(new TreeNode(node.children[0].value, astNode));
			} else if (node.children.length === 5) {
				this.analyzeExpression(node.children[1], scope, astNode);
				astNode.addChildNode(new TreeNode(node.children[2].value, astNode));
				this.analyzeExpression(node.children[3], scope, astNode);
			} else {
				throw new Error('Malformed BooleanExpression');
			}
		}

		private drawTree(node: TreeNode, id: string) {
			var img = go(node.toSynTree(), 13, '', '', 40, 10, true, true);
			$('#' + id).empty();
			$('#' + id).append(img);
		}

		public static clearTreeDisplay() {
			$('.tree-graph').empty();
		}

		private assertType(val: any, type: any) {
			if (typeof val == typeof type) {
				return true;
			} else {
				throw new Error('Expected ' + typeof type + ' but got ' + typeof val + ' instead');
			}
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
	}
}
