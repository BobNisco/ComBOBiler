///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />

module Combobiler {
	export class Lexer {
		private source: string;

		constructor(s: string) {
			this.source = $.trim(s);
		}

		public performLexicalAnalysis() {
			// Split the source code by spaces
			var splitSource = this.source.split(' ');
			LOGGER.headerInfo('Lexical Analysis Start');
		}
	}
}
