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
        }
        Scope.prototype.getParent = function () {
            return this.parent;
        };

        Scope.prototype.addSymbol = function (key, value) {
            this.symbols[key] = value;
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
        return Scope;
    })();
    Combobiler.Scope = Scope;
})(Combobiler || (Combobiler = {}));
