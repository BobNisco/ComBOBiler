///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
var Combobiler;
(function (Combobiler) {
    var Lexer = (function () {
        function Lexer(s) {
            this.source = $.trim(s);
        }
        return Lexer;
    })();
    Combobiler.Lexer = Lexer;
})(Combobiler || (Combobiler = {}));
