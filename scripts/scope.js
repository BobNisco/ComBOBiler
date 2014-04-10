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
