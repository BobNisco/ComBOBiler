///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
///<reference path="lexer.ts" />
var Combobiler;
(function (Combobiler) {
    var Parser = (function () {
        function Parser() {
            // Define some default logger options for the parser
            this.loggerOptions = {
                type: 'parser',
                header: 'Parser'
            };
        }
        return Parser;
    })();
    Combobiler.Parser = Parser;
})(Combobiler || (Combobiler = {}));
