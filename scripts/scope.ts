///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />

module Combobiler {
	export class Scope {
		private symbols: Object;
		private parent: Scope;

		constructor(symbols: Object, parent: Scope) {
		    this.symbols = symbols;
		    this.parent = parent;
		}

		public getParent() {
			return this.parent;
		}

		public addSymbol(key: any, value: any) {
			this.symbols[key] = value;
		}
	}
}
