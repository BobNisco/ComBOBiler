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
			this.log('==== Lexical Analysis Start ====');
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
							this.log('Found token ' + newToken.toString());
						} else {
							this.error('Lexical error in token ' + current + ' on line ' + line + 1);
							// TODO: Once all rules of grammar are implemented, we want to
							// break if there ever is an error. But for now, it helps us debug
							//break;
						}
					}
				}
			}
			this.log('==== Lexical Analysis End ====');
			return tokenStream;
		}

		/**
		 * Internal handler for passing our log message to the logger. This method should
		 * be used for non-errors in the lexer.
		 *
		 * @param message the text to be put into the output field
		 */
		private log(message: string) {
			LOGGER.log($.extend({displayClass: 'label-info'}, this.loggerOptions), message);
		}

		/**
		 * Internal handler for passsing our error message to the logger. This method
		 * should be used for errors in the lexer.
		 *
		 * @param message the text to be put into the output field
		 */
		private error(message: string) {
			LOGGER.log($.extend({displayClass: 'label-danger'}, this.loggerOptions), message);
		}
	}
}
