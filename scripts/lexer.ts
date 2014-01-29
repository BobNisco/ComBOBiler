///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />

module Combobiler {
	export class Lexer {
		private source: string;
		private currentLine = 1;

		constructor(s: string) {
			this.source = $.trim(s);
		}

		public performLexicalAnalysis() {
			var regExForNewLine = /\r|\n/;
			// Split the source code by spaces
			var splitSource = this.source.split(' ');
			LOGGER.info('Lexical Analysis Start');
			// Our return (strongly-typed in TypeScript) array of Tokens
			var tokenStream = new Array<Token>();

			for (var i in splitSource) {
				var current = splitSource[i];
				if (current !== '') {
					var needToAdvanceLine = false;
					// Check if we need to advance the current line that we're on
					if (regExForNewLine.exec(current)) {
						needToAdvanceLine = true;
						// Strip the newline character from the current node so that
						// we can match it properly in the makeNewToken function
						current = current.replace(regExForNewLine, '');
					}
					tokenStream.push(Combobiler.Token.makeNewToken(current, this.currentLine));
					// Advance the line AFTER we're done lexing
					if (needToAdvanceLine) {
						this.currentLine += 1;
					}
				}
			}
			return tokenStream;
		}
	}
}
