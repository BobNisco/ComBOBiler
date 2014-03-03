///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
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
        return Scope;
    })();
    Combobiler.Scope = Scope;
})(Combobiler || (Combobiler = {}));
