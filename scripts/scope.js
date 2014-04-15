///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
///<reference path="scope_node.ts" />
var Combobiler;
(function (Combobiler) {
    var Scope = (function () {
        function Scope(symbols, parent) {
            this.symbols = symbols;
            this.parent = parent;
            this.children = new Array();
        }
        Scope.prototype.getParent = function () {
            return this.parent;
        };

        Scope.prototype.addSymbol = function (key, value) {
            this.symbols[key] = value;
        };

        Scope.prototype.assignValue = function (key, value) {
            var scopeNode = Scope.findSymbolInScope(key, this);
            if (scopeNode) {
                scopeNode.value = value;
            } else {
                /* TODO: Think of how to handle this error
                Since this is a function that will primarily be used in Parse
                we shouldn't be checking if the value exists yet. */
            }
        };

        Scope.findSymbolInScope = function (symbol, scope) {
            if (!scope) {
                throw new Error('Symbol ' + symbol + ' not found in symbol table');
            }
            if (scope.symbols[symbol]) {
                return scope.symbols[symbol];
            }
            return this.findSymbolInScope(symbol, scope.parent);
        };

        Scope.prototype.getSymbols = function () {
            return this.symbols;
        };

        Scope.prototype.findSymbol = function (key) {
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
        };

        Scope.prototype.toString = function () {
            var result = '';
            for (var k in this.symbols) {
                result += 'symbol: ' + k + ', ' + this.symbols[k].toString() + ', ';
            }
            return result;
        };
        return Scope;
    })();
    Combobiler.Scope = Scope;
})(Combobiler || (Combobiler = {}));
