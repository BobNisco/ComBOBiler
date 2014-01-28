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
			LOGGER.headerInfo('Lexical Analysis Start');
			console.log(splitSource);
			for (var i in splitSource) {
				var current = splitSource[i];
				if (current !== '') {
					// Check if we need to advance the current line that we're on
					if (regExForNewLine.exec(current)) {
						this.currentLine += 1;
					}
					console.log(Combobiler.Token.makeNewToken(splitSource[i], this.currentLine));
				}
			}
		}
	}
}
