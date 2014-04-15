///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
///<reference path="lexer.ts" />
///<reference path="scope.ts" />
///<reference path="scope_node.ts" />

module Combobiler {
	export class Parser {
		// Define some default logger options for the parser
		private loggerOptions = {
			type: 'parser',
			header: 'Parser',
		};

		private tokens: Array<Token>;

		private current: number;

		private rootNode: TreeNode;

		// We'll keep reference to the "current scope"
		// We will instantiate it with a blank Scope instance
		private currentScope: Scope;

		constructor(tokens: Array<Token>) {
			this.tokens = tokens;
			this.current = -1;
			this.currentScope = new Scope({}, null);
		}

		public performParse() {
			this.log({
				standard: '==== Parse start ====',
				sarcastic: '==== Parse start ===='
			});
			if (this.tokens.length <= 0) {
				throw new Error('No tokens found, can\'t parse anything!');
			} else {
				try {
					this.parseProgram(this.rootNode);
					this.log({
						standard: '==== Parse end ====',
						sarcastic: '==== Parse end ===='
					});
					return {
						rootNode: this.rootNode,
						currentScope: this.currentScope
					};
				} catch (error) {
					this.error({
						standard: error,
						sarcastic: error,
					});

					this.error({
						standard: '==== Parse ended due to error ====',
						sarcastic: '==== Parse ended due to error ===='
					});
				}
			}
		}

		private makeNewScope() {
			var temp = new Scope({}, this.currentScope);
			this.currentScope.children.push(temp);
			this.currentScope = temp;
		}

		private closeCurrentScope() {
			this.currentScope = this.currentScope.parent;
		}

		private parseProgram(node: TreeNode) {
			this.rootNode = new TreeNode('Program', null);
			node = this.rootNode;

			this.parseBlock(node, this.getNextToken());
			var token = this.getNextToken();
			if (token instanceof EndBlock) {
				node.addChildNode('$');
				//this.makeNewChildNode(node, '$');
				this.log({
					standard: 'Hooray! We parsed your program!',
					sarcastic: 'Your program is parsed, but please don\'t make me do more. I\'m tired.'
				});
			} else {
				throw new Error('Error while parsing block. Expected end program symbol "$", but got ' + token.symbol + ' on line ' + token.line);
			}
		}

		private parseBlock(node: TreeNode, token: Token) {
			node.addChildNode('Block');
			// Set the "current node" to be the new block node
			node = node.getNewestChild();

			this.assertToken(token, OpenBrace);
			node.addChildNode(token);
			this.makeNewScope();
			this.log({
				standard: 'Opening up a new scope block on line ' + token.line,
				sarcastic: 'Opening up a new scope block on line ' + token.line,
			});

			var startLine = token.line;
			this.parseStatementList(node);

			token = this.getNextToken();
			this.assertToken(token, CloseBrace);
			//this.makeNewSiblingNode(token);
			node.addChildNode(token);

			// Log the block scope, if there was anything in there
			if (Object.keys(this.currentScope.getSymbols()).length > 0) {
				this.log({
					standard: 'The scope block being closed held the following info ' + this.currentScope.toString(),
					sarcastic: 'The scope block being closed held the following info ' + this.currentScope.toString(),
				});
			}
			// At this point, the block is closed, therefore we can move the currentScope
			// pointer back to the currentScope's parent.
			this.closeCurrentScope();
			this.log({
				standard: 'Parsed a block that started on line ' + startLine + ' and ended on line ' + token.line,
				sarcastic: 'I don\'t have something sarcastic to say, but yay we parsed a block on line ' + startLine + ' and ended on line ' + token.line
			});
		}

		private parseStatementList(node: TreeNode) {
			while(!(this.peekNextToken() instanceof CloseBrace)) {
				node.addChildNode('StatementList');
				node = node.getNewestChild();

				var token = this.getNextToken();

				if (token instanceof Print) {
					this.parsePrintStatement(node, token);
				} else if (token instanceof VariableIdentifier && this.peekNextToken() instanceof Assignment) {
					this.parseAssignmentStatement(node, token);
				} else if (token instanceof Combobiler.Int || token instanceof Combobiler.String || token instanceof Combobiler.Boolean) {
					this.parseVariableDeclaration(node, token);
				} else if (token instanceof While) {
					this.parseWhileStatement(node, token);
				} else if (token instanceof If) {
					this.parseIfStatement(node, token);
				} else if (token instanceof OpenBrace) {
					this.parseBlock(node, token);
				} else {
					throw new Error('Tried to parse statement list, but could not find valid statement on line ' + token.line);
				}
			}
		}

		private parsePrintStatement(node: TreeNode, token: Token) {
			// Make a new PrintStatement Node
			node.addChildNode('PrintStatement');
			node = node.getNewestChild();

			this.assertToken(token, Print);
			node.addChildNode(token);

			token = this.getNextToken();
			this.assertToken(token, LParen);
			node.addChildNode(token);

			// RECURSE!
			this.parseExpression(node, this.getNextToken());

			token = this.getNextToken();
			this.assertToken(token, RParen);
			node.addChildNode(token);

			this.log({
				standard: 'Parsed a print statement on line ' + token.line,
				sarcastic: 'Parsed a print statement on line ' + token.line,
			});
		}

		private parseAssignmentStatement(node: TreeNode, token: Token) {
			node.addChildNode('AssignmentStatement');
			node = node.getNewestChild();

			// Capture some variables so we can add to the symbol table/scope blocks
			var varId = token;

			this.assertToken(varId, VariableIdentifier);
			node.addChildNode(varId);

			token = this.getNextToken();
			this.assertToken(token, Assignment);
			node.addChildNode(token);

			var exprToken: Token = this.getNextToken();
			var value = this.parseExpression(node, exprToken);
			var scopeNode: ScopeNode;

			if (exprToken instanceof Combobiler.IntValue) {
				scopeNode = new ScopeNode(value, 'int');
			} else if (exprToken instanceof Combobiler.StringValue) {
				scopeNode = new ScopeNode(value, 'string');
			} else if (exprToken instanceof Combobiler.True || exprToken instanceof Combobiler.False) {
				scopeNode = new ScopeNode(value, 'bool');
			} else if (exprToken instanceof Combobiler.VariableIdentifier) {
				scopeNode = new ScopeNode(exprToken.value, 'varid');
			} else if (exprToken instanceof Combobiler.LParen) {
				scopeNode = new ScopeNode('bool expression', 'bool');
			} else {
				throw new Error('Unrecognized type');
			}
			this.currentScope.assignValue(varId.value, value);
			this.log({
				standard: 'Symbol ' + varId.value + ' was assigned value ' + scopeNode.getValue() + ' in symbol table',
				sarcastic: 'Symbol ' + varId.value + ' was assigned value ' + scopeNode.getValue() + ' in symbol table',
			});
			this.log({
				standard: 'Parsed assignment statement on line ' + token.line,
				sarcastic: 'Parsed assignment statement on line ' + token.line,
			});
		}

		private parseExpression(node: TreeNode, token: Token) {
			node.addChildNode('Expression');
			node = node.getNewestChild();

			if (token instanceof Combobiler.IntValue) {
				return this.parseIntExpression(node, token);
			} else if (token instanceof Combobiler.StringValue) {
				return this.parseStringExpression(node, token);
			} else if (token instanceof Combobiler.Boolean || token instanceof Combobiler.True
				|| token instanceof Combobiler.False || token instanceof Combobiler.LParen) {
				return this.parseBooleanExpression(node, token);
			} else if (token instanceof VariableIdentifier) {
				this.parseId(node, token);
			} else {
				throw new Error('Error while parsing expression on line ' + token.line);
			}
		}

		private parseIntExpression(node: TreeNode, token: Token) {
			node.addChildNode('IntExpression');
			node = node.getNewestChild();

			var resultValue = +token.value;
			this.assertToken(token, Combobiler.IntValue);
			node.addChildNode(token);

			if (this.peekNextToken() instanceof Plus) {
				token = this.getNextToken();
				this.assertToken(token, Plus);
				node.addChildNode(token);

				token = this.getNextToken();
				this.parseExpression(node, token);
				resultValue += +token.value;
			}
			this.log({
				standard: 'Parsed int expression on line ' + token.line,
				sarcastic: 'Parsed int expression on line ' + token.line,
			});
			return +resultValue;
		}

		private parseStringExpression(node: TreeNode, token: Token) {
			node.addChildNode('StringExpression');
			node = node.getNewestChild();

			this.assertToken(token, Combobiler.StringValue);
			node.addChildNode(token);

			this.log({
				standard: 'Parsed string expression on line ' + token.line,
				sarcastic: 'Parsed string expression on line ' + token.line,
			});
			return token.value;
		}

		private parseBooleanExpression(node: TreeNode, token: Token) {
			node.addChildNode('BooleanExpression');
			node = node.getNewestChild();

			var resultValue;
			if (token instanceof LParen) {
				this.assertToken(token, LParen);
				node.addChildNode(token);

				this.parseExpression(node, this.getNextToken());
				token = this.getNextToken();
				this.assertTokenInSet(token, [Equality, NonEquality]);
				node.addChildNode(token);

				this.parseExpression(node, this.getNextToken());

				token = this.getNextToken();
				this.assertToken(token, RParen);
				node.addChildNode(token);
			} else if (token instanceof Combobiler.False || token instanceof Combobiler.True) {
				this.assertTokenInSet(token, [Combobiler.False, Combobiler.True]);
				node.addChildNode(token);

				// Needs to return a JS bool value from this function
				resultValue = token instanceof Combobiler.True;
			} else {
				throw new Error('Not a valid Boolean Expression');
			}
			this.log({
				standard: 'Parsed boolean expression statement on line ' + token.line,
				sarcastic: 'Parsed boolean expression statement on line ' + token.line,
			});
			return resultValue;
		}

		private parseId(node: TreeNode, token: Token) {
			node.addChildNode('Id');
			node = node.getNewestChild();

			this.assertToken(token, VariableIdentifier);
			node.addChildNode(token);
			this.log({
				standard: 'Parsed ID on line ' + token.line,
				sarcastic: 'Parsed ID on line ' + token.line,
			});
		}

		private parseVariableDeclaration(node: TreeNode, token: Token) {
			node.addChildNode('VarDecl');
			node = node.getNewestChild();

			var scopeNode: ScopeNode = new ScopeNode(null, token.symbol);
			this.assertTokenInSet(token, [Combobiler.String, Combobiler.Int, Combobiler.Boolean]);
			node.addChildNode(token);

			token = this.getNextToken();
			this.parseId(node, token);
			this.currentScope.addSymbol(token.value, scopeNode);
			node.addChildNode(token);

			this.log({
				standard: 'Added symbol ' + token.value + ' of type ' + scopeNode.getType() + ' to symbol table',
				sarcastic: 'Added symbol ' + token.value + ' of type ' + scopeNode.getType() + ' to symbol table',
			});
			this.log({
				standard: 'Parsed variable declaration statement on line ' + token.line,
				sarcastic: 'Parsed variable declaration statement on line ' + token.line,
			});
		}

		private parseWhileStatement(node: TreeNode, token: Token) {
			node.addChildNode('WhileStatement');
			node = node.getNewestChild();

			this.assertToken(token, Combobiler.While);
			node.addChildNode(token);

			this.parseBooleanExpression(node, this.getNextToken());
			this.parseBlock(node, this.getNextToken());
			this.log({
				standard: 'Parsed while statement on line ' + token.line,
				sarcastic: 'Parsed while statement on line ' + token.line,
			});
		}

		private parseIfStatement(node: TreeNode, token: Token) {
			node.addChildNode('IfStatement');
			node = node.getNewestChild();

			this.assertToken(token, Combobiler.If);
			node.addChildNode(token);

			this.parseBooleanExpression(node, this.getNextToken());
			this.parseBlock(node, this.getNextToken());
			this.log({
				standard: 'Parsing if statement on line ' + token.line,
				sarcastic: 'Parsing if statement on line ' + token.line,
			});
		}

		private peekNextToken() {
			return this.tokens[this.current + 1];
		}

		private getNextToken() {
			var token = this.tokens[++this.current];
			if (token == null) {
				throw new Error('Ran out of tokens, even though we were expecting more');
			}
			return token;
		}

		private assertToken(token: Token, type: any) {
			if (token instanceof type) {
				return true;
			} else {
				throw new Error('Expected ' + type.symbol + ' but got ' + token.symbol + ' instead');
			}
		}

		private assertTokenInSet(token: Token, types: any) {
			var found = false;
			for (var t in types) {
				if (token instanceof types[t]) {
					found = true;
					break;
				}
			}
			if (found) {
				return true;
			} else {
				var expectedString = '';
				for (var t in types) {
					expectedString += types[t].symbol + ', ';
				}
				throw new Error('Expected one of the following(' + expectedString + ') but got ' + token.symbol + ' instead');
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
