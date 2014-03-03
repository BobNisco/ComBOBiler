///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
///<reference path="lexer.ts" />

module Combobiler {
	export class Parser {
		// Define some default logger options for the parser
		private loggerOptions = {
			type: 'parser',
			header: 'Parser',
		};

		private tokens: Array<Token>;

		private current: number;

		constructor(tokens: Array<Token>) {
			this.tokens = tokens;
			this.current = -1;
		}

		public performParse() {
			this.log({
				standard: '==== Parse start ====',
				sarcastic: '==== Parse start ===='
			});
			if (this.tokens.length <= 0) {
				this.error({
					standard: 'No tokens found, can\'t parse anything!',
					sarcastic: 'What the hell am I supposed to do without a single token?'
				});
			} else {
				try {
					this.parseProgram();
					this.log({
						standard: '==== Parse end ====',
						sarcastic: '==== Parse end ===='
					});
				} catch (error) {
					this.error({
						standard: '==== Parse ended due to error ====',
						sarcastic: '==== Parse ended due to error ===='
					});
				}
			}
		}

		private parseProgram() {
			this.parseBlock();
			var token = this.getNextToken();
			if (token instanceof EndBlock) {
				this.log({
					standard: 'Hooray! We parsed your program!',
					sarcastic: 'Your program is parsed, but please don\'t make me do more. I\'m tired.'
				});
			} else {
				this.error({
					standard: 'Error while parsing block. Expected end program symbol "$", but got ' + token.symbol + ' on line ' + token.line,
					sarcastic: 'Do you do anything right? I\'m trying to finish parsing your program, but got ' + token.symbol + ' on line ' + token.line
				})
			}
		}

		private parseBlock() {
			var token = this.getNextToken();
			this.assertToken(token, OpenBrace);
			var startLine = token.line;
			this.parseStatementList();
			token = this.getNextToken();
			this.assertToken(token, CloseBrace);
			this.log({
				standard: 'Parsed a block that started on line ' + startLine + ' and ended on ' + token.line,
				sarcastic: 'I don\'t have something sarcastic to say, but yay we parsed a block on line ' + startLine + ' and ended on ' + token.line
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
					this.parseBlock();
				} else {
					this.error({
						standard: 'Tried to parse statement list, but could not find valid statement on line ' + token.line,
						sarcastic: 'Why do you even program if you can\'t get a simple statement correct on line ' + token.line
					});
				}
			}
		}

		private parsePrintStatement(token: Token) {
			this.assertToken(token, Print);
			this.assertToken(this.getNextToken(), LParen);
			//this.parseExpression();
			this.assertToken(this.getNextToken(), RParen);
			this.log({
				standard: 'Parsed a print statement on line',
				sarcastic: 'Parsed a print statement on line'
			});
		}

		private parseAssignmentStatement(token: Token) {
			this.assertToken(token, VariableIdentifier);
			this.assertToken(this.getNextToken(), Assignment);
			//this.assertTokenInSet(this.getNextToken(),)
			this.log({
				standard: 'Parsing assignment statement on line ' + token.line,
				sarcastic: 'Parsing assignment statement on line ' + token.line,
			});
		}

		private parseExpression(token: Token) {

		}

		private parseIntExpression(token: Token) {
			this.assertToken(token, Combobiler.Int);
			if (this.peekNextToken() instanceof Plus) {
				this.assertToken(this.getNextToken(), Plus);
				this.parseExpression(this.getNextToken());
			}
		}

		private parseStringExpression(token: Token) {
			this.assertToken(token, Combobiler.String);
		}

		private parseBooleanExpression(token: Token) {
			this.assertToken(token, LParen);
			this.parseExpression(this.getNextToken());
			this.assertTokenInSet(this.getNextToken(), [Equality, NonEquality]);
			this.parseExpression(this.getNextToken());
			this.assertToken(this.getNextToken(), RParen);
		}

		private parseVariableDeclaration(token: Token) {
			this.log({
				standard: 'Parsing variable declaration statement on line ' + token.line,
				sarcastic: 'Parsing variable declaration statement on line ' + token.line,
			});
		}

		private parseWhileStatement(token: Token) {
			this.log({
				standard: 'Parsing while statement on line ' + token.line,
				sarcastic: 'Parsing while statement on line ' + token.line,
			});
		}

		private parseIfStatement(token: Token) {
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
				this.error({
					standard: 'Ran out of tokens, even though we were expecting more',
					sarcastic: 'Ran out of tokens, phew, I was tired anyway'
				});
			}
			return token;
		}

		private assertToken(token: Token, type: any) {
			if (token instanceof type) {
				this.log({
					standard: 'Parsed a token of type ' + token.symbol,
					sarcastic: 'Parsed a token of type ' + token.symbol
				});
				return true;
			} else {
				throw new Error('Expected ' + type.symbol + ' but got ' + token.symbol + ' instead');
			}
		}

		private assertTokenInSet(token: Token, types: any) {
			var found = false;
			for (var t in types) {
				if (token instanceof t) {
					found = true;
					break;
				}
			}
			if (found) {
				return true;
			} else {
				var expectedString = '';
				for (var t in types) {
					expectedString += t.symbol + ', ';
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
