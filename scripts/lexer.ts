///<reference path="token.ts" />
///<reference path="jquery.d.ts" />

module Combobiler {
	export class Lexer {
		private source: string;

		constructor(s: string) {
			this.source = $.trim(s);
		}
	}
}
