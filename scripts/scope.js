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
        return Scope;
    })();
    Combobiler.Scope = Scope;
})(Combobiler || (Combobiler = {}));
