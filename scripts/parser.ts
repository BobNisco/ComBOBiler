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

		private currentNode: TreeNode;

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
					this.parseProgram();
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

		private makeNewChildNode(value: any) {
			var temp = new TreeNode(value, this.currentNode);
			this.currentNode.children.push(temp);
			this.currentNode = temp;
		}

		private makeNewSiblingNode(value: any) {
			var temp = new TreeNode(value, this.currentNode.parent);
			this.currentNode.parent.children.push(temp);
			this.currentNode = temp;
		}

		private makeNewScope() {
			var temp = new Scope({}, this.currentScope);
			this.currentScope.children.push(temp);
			this.currentScope = temp;
		}

		private closeCurrentScope() {
			this.currentScope = this.currentScope.parent;
		}

		private parseProgram() {
			this.rootNode = new TreeNode('program', null);
			this.currentNode = this.rootNode;
			this.parseBlock(this.getNextToken());
			var token = this.getNextToken();
			if (token instanceof EndBlock) {
				this.makeNewChildNode('$');
				this.log({
					standard: 'Hooray! We parsed your program!',
					sarcastic: 'Your program is parsed, but please don\'t make me do more. I\'m tired.'
				});
			} else {
				throw new Error('Error while parsing block. Expected end program symbol "$", but got ' + token.symbol + ' on line ' + token.line);
			}
		}

		private parseBlock(token: Token) {
			this.assertToken(token, OpenBrace);
			this.makeNewChildNode(token);
			this.makeNewScope();
			this.log({
				standard: 'Opening up a new scope block on line ' + token.line,
				sarcastic: 'Opening up a new scope block on line ' + token.line,
			});
			var startLine = token.line;
			this.parseStatementList();
			token = this.getNextToken();
			this.assertToken(token, CloseBrace);
			this.makeNewSiblingNode(token);
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

		private parseStatementList() {
			while(!(this.peekNextToken() instanceof CloseBrace)) {
				var token = this.getNextToken();

				if (token instanceof Print) {
					this.parsePrintStatement(token);
				} else if (token instanceof VariableIdentifier && this.peekNextToken() instanceof Assignment) {
					this.parseAssignmentStatement(token);
				} else if (token instanceof Combobiler.Int || token instanceof Combobiler.String || token instanceof Combobiler.Boolean) {
					this.parseVariableDeclaration(token);
				} else if (token instanceof While) {
					this.parseWhileStatement(token);
				} else if (token instanceof If) {
					this.parseIfStatement(token);
				} else if (token instanceof OpenBrace) {
					this.parseBlock(token);
				} else {
					throw new Error('Tried to parse statement list, but could not find valid statement on line ' + token.line);
				}
			}
		}

		private parsePrintStatement(token: Token) {
			this.assertToken(token, Print);
			this.makeNewChildNode(token);
			token = this.getNextToken();
			this.assertToken(token, LParen);
			this.makeNewSiblingNode(token);
			this.parseExpression(this.getNextToken());
			token = this.getNextToken();
			this.assertToken(token, RParen);
			this.makeNewSiblingNode(token);
			this.log({
				standard: 'Parsed a print statement on line ' + token.line,
				sarcastic: 'Parsed a print statement on line ' + token.line,
			});
		}

		private parseAssignmentStatement(token: Token) {
			// Capture some variables so we can add to the symbol table/scope blocks
			var varId = token;
			this.assertToken(varId, VariableIdentifier);
			this.makeNewChildNode(varId);
			token = this.getNextToken();
			this.assertToken(token, Assignment);
			this.makeNewSiblingNode(token);
			var exprToken: Token = this.getNextToken();
			var value = this.parseExpression(exprToken);
			var node: ScopeNode;

			if (exprToken instanceof Combobiler.IntValue) {
				node = new ScopeNode(value, 'int');
			} else if (exprToken instanceof Combobiler.StringValue) {
				node = new ScopeNode(value, 'string');
			} else if (exprToken instanceof Combobiler.True || exprToken instanceof Combobiler.False) {
				node = new ScopeNode(value, 'bool');
			} else if (exprToken instanceof Combobiler.VariableIdentifier) {
				node = new ScopeNode(exprToken.value, 'varid');
			} else if (exprToken instanceof Combobiler.LParen) {
				node = new ScopeNode('bool expression', 'bool');
			} else {
				throw new Error('Unrecognized type');
			}
			this.currentScope.addSymbol(varId.value, node);
			this.log({
				standard: 'Symbol ' + varId.value + ' was assigned value ' + node.getValue() + ' in symbol table',
				sarcastic: 'Symbol ' + varId.value + ' was assigned value ' + node.getValue() + ' in symbol table',
			});
			this.log({
				standard: 'Parsed assignment statement on line ' + token.line,
				sarcastic: 'Parsed assignment statement on line ' + token.line,
			});
		}

		private parseExpression(token: Token) {
			if (token instanceof Combobiler.IntValue) {
				return this.parseIntExpression(token);
			} else if (token instanceof Combobiler.StringValue) {
				return this.parseStringExpression(token);
			} else if (token instanceof Combobiler.Boolean || token instanceof Combobiler.True
				|| token instanceof Combobiler.False || token instanceof Combobiler.LParen) {
				return this.parseBooleanExpression(token);
			} else if (token instanceof VariableIdentifier) {
				this.parseId(token);
			} else {
				throw new Error('Error while parsing expression on line ' + token.line);
			}
		}

		private parseIntExpression(token: Token) {
			var resultValue = +token.value;
			this.assertToken(token, Combobiler.IntValue);
			this.makeNewChildNode(token);
			if (this.peekNextToken() instanceof Plus) {
				token = this.getNextToken();
				this.assertToken(token, Plus);
				this.makeNewSiblingNode(token);
				token = this.getNextToken();
				this.parseExpression(token);
				resultValue += +token.value;
			}
			this.log({
				standard: 'Parsed int expression on line ' + token.line,
				sarcastic: 'Parsed int expression on line ' + token.line,
			});
			return +resultValue;
		}

		private parseStringExpression(token: Token) {
			this.assertToken(token, Combobiler.StringValue);
			this.makeNewChildNode(token);
			this.log({
				standard: 'Parsed string expression on line ' + token.line,
				sarcastic: 'Parsed string expression on line ' + token.line,
			});
			return token.value;
		}

		private parseBooleanExpression(token: Token) {
			var resultValue;
			if (token instanceof LParen) {
				this.assertToken(token, LParen);
				this.makeNewChildNode(token);
				this.parseExpression(this.getNextToken());

				token = this.getNextToken();
				this.assertTokenInSet(token, [Equality, NonEquality]);
				this.makeNewSiblingNode(token);

				this.parseExpression(this.getNextToken());

				token = this.getNextToken();
				this.assertToken(token, RParen);
				this.makeNewSiblingNode(token);
			} else if (token instanceof Combobiler.False || token instanceof Combobiler.True) {
				this.assertTokenInSet(token, [Combobiler.False, Combobiler.True]);
				this.makeNewChildNode(token);

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

		private parseId(token: Token) {
			this.assertToken(token, VariableIdentifier);
			this.makeNewChildNode(token);
			this.log({
				standard: 'Parsed ID on line ' + token.line,
				sarcastic: 'Parsed ID on line ' + token.line,
			});
		}

		private parseVariableDeclaration(token: Token) {
			var node: ScopeNode = new ScopeNode(null, token.symbol);
			this.assertTokenInSet(token, [Combobiler.String, Combobiler.Int, Combobiler.Boolean]);
			this.makeNewChildNode(token);

			token = this.getNextToken();
			this.parseId(token);
			this.currentScope.addSymbol(token.value, node);
			this.makeNewChildNode(token);

			this.log({
				standard: 'Added symbol ' + token.value + ' of type ' + node.getType() + ' to symbol table',
				sarcastic: 'Added symbol ' + token.value + ' of type ' + node.getType() + ' to symbol table',
			});
			this.log({
				standard: 'Parsed variable declaration statement on line ' + token.line,
				sarcastic: 'Parsed variable declaration statement on line ' + token.line,
			});
		}

		private parseWhileStatement(token: Token) {
			this.assertToken(token, Combobiler.While);
			this.makeNewChildNode(token);

			this.parseBooleanExpression(this.getNextToken());
			this.parseBlock(this.getNextToken());
			this.log({
				standard: 'Parsed while statement on line ' + token.line,
				sarcastic: 'Parsed while statement on line ' + token.line,
			});
		}

		private parseIfStatement(token: Token) {
			this.assertToken(token, Combobiler.If);
			this.makeNewChildNode(token);

			this.parseBooleanExpression(this.getNextToken());
			this.parseBlock(this.getNextToken());
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

		private assertType(val: any, type: any) {
			if (typeof val == typeof type) {
				return true;
			} else {
				throw new Error('Expected ' + typeof type + ' but got ' + typeof val + ' instead');
			}
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
