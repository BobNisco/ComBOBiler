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
				this.parseProgram();
			}
			this.log({
				standard: '==== Parse end ====',
				sarcastic: '==== Parse end ===='
			});
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
			if (token instanceof OpenBrace) {
				var startLine = token.line;
				this.parseStatementList();
				token = this.getNextToken();
				if (token instanceof CloseBrace) {
					var endLine = token.line;
					this.log({
						standard: 'Parsed a block that started on line ' + startLine + ' and ended on ' + endLine,
						sarcastic: 'I don\'t have something sarcastic to say, but yay we parsed a block on line ' + startLine + ' and ended on ' + endLine
					});
				}
			} else {
				this.error({
					standard: 'Error while parsing block. Expected open brace "{", but got ' + token.symbol + ' on line ' + token.line,
					sarcastic: 'Oh great, another error by you. This time it happened on line ' + token.line + ' but I\'ll leave it up to you to figure the rest out'
				})
			}
		}

		private parseStatementList() {
			while(!(this.peekNextToken() instanceof CloseBrace)) {
				var token = this.getNextToken();

				if (token instanceof Print) {
					this.parsePrintStatement(token);
				} else if (token instanceof Assignment) {
					this.parseAssignmentStatement(token);
				} else if (token instanceof VariableIdentifier) {
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
			this.log({
				standard: 'Parsing print statement on line ' + token.line,
				sarcastic: 'Parsing print statement on line ' + token.line,
			});
		}

		private parseAssignmentStatement(token: Token) {
			this.log({
				standard: 'Parsing assignment statement on line ' + token.line,
				sarcastic: 'Parsing assignment statement on line ' + token.line,
			});
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
