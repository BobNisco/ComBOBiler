///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
///<reference path="scope_node.ts" />

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

		public addSymbol(key: any, value: ScopeNode) {
			this.symbols[key] = value;
		}

		public getSymbols() {
			return this.symbols;
		}

		public findSymbol(key: any) {
			// Check to see if the key exists in this scope
			for (var k in this.symbols) {
				if (k == key) {
					return this.symbols[k];
				}
			}
			if (this.parent != null) {
				// Else, we'll walk up the tree
				return this.parent.findSymbol(key);
			}
			return null;
		}

		public toString() {
			var result: string = '';
			for (var k in this.symbols) {
				result += 'symbol: ' + k + ', ' + this.symbols[k].toString() + ', ';
			}
			return result;
		}
	}
}
