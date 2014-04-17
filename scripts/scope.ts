///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
///<reference path="scope_node.ts" />

module Combobiler {
	export class Scope {
		public children: Array<Scope>;

		constructor(public symbols: Object, public parent: Scope) {
			this.children = new Array<Scope>();
		}

		public getParent() {
			return this.parent;
		}

		public addSymbol(key: any, value: ScopeNode) {
			this.symbols[key] = value;
		}

		public addChildScope(value: any) {
			this.children.push(new Scope({}, this));
		}

		public getNewestChild() {
			return this.children[this.children.length - 1];
		}

		public assignValue(key: any, value: any) {
			var scopeNode = Scope.findSymbolInScope(key, this);
			if (scopeNode) {
				scopeNode.value = value;
			} else {
				/* TODO: Think of how to handle this error
				   Since this is a function that will primarily be used in Parse
				   we shouldn't be checking if the value exists yet. */

			}
		}

		public static findSymbolInScope(symbol: string, scope: Scope) {
			if (!scope) {
				throw new Error('Symbol ' + symbol + ' not found in symbol table');
			}
			if (scope.symbols[symbol]) {
				return scope.symbols[symbol];
			}
			return this.findSymbolInScope(symbol, scope.parent);
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
