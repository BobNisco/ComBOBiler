///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />

module Combobiler {
	export class Lexer {
		private source: string;
		// Define some default logger options for the lexer
		private loggerOptions = {
			type: 'lex',
			header: 'Lexer',
		};

		constructor(s: string) {
			this.source = $.trim(s);
		}

		public performLexicalAnalysis() {
			// Split the source code by lines
			var splitSource = this.source.split('\n');
			this.log({
				standard: '==== Lexical Analysis Start ====',
				sarcastic: '==== Lexical Analysis Start ===='
			});
			// Our return (strongly-typed in TypeScript) array of Tokens
			var tokenStream = new Array<Token>();

			for (var line = 0; line < splitSource.length; line++) {
				var currentLine = splitSource[line];
				// Split each part of the line up by spaces
				var splitLine = currentLine.split(' ');

				for (var i = 0; i < splitLine.length; i++) {
					var current = splitLine[i];
					if (current !== '') {
						var newToken = Combobiler.Token.makeNewToken(current, line + 1);
						if (newToken != null) {
							tokenStream.push(newToken);
							this.log({
								standard: 'Found token ' + newToken.toString(),
								sarcastic: 'Cool, a token ' + newToken.toString() + ' but who cares?'
							});
						} else {
							this.error({
								standard: 'Lexical error: ' + current + ' on line ' + (line + 1),
								sarcastic: 'You dun goofed, lex error ' + current + ' on line ' + (line + 1)
							});
						}
					}
				}
			}
			this.log({
				standard: '==== Lexical Analysis End ====',
				sarcastic: '==== Lexical Analysis End ===='
			});
			return tokenStream;
		}

		/**
		 * Internal handler for passing our log message to the logger. This method should
		 * be used for non-errors in the lexer.
		 *
		 * @param message the text to be put into the output field
		 */
		private log(messages: Object) {
			LOGGER.log($.extend({displayClass: 'label-info'}, this.loggerOptions), messages);
		}

		/**
		 * Internal handler for passsing our error message to the logger. This method
		 * should be used for errors in the lexer.
		 *
		 * @param message the text to be put into the output field
		 */
		private error(messages: Object) {
			LOGGER.log($.extend({displayClass: 'label-danger'}, this.loggerOptions), messages);
		}
	}
}
