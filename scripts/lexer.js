///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
var Combobiler;
(function (Combobiler) {
    var Lexer = (function () {
        function Lexer(s) {
            this.source = $.trim(s);
        }
        Lexer.prototype.performLexicalAnalysis = function () {
            // Split the source code by spaces
            var splitSource = this.source.split(' ');
            LOGGER.headerInfo('Lexical Analysis Start');
            console.log(splitSource);
            for (var i in splitSource) {
                var current = splitSource[i];
                if (current !== '') {
                    console.log(Combobiler.Token.makeNewToken(splitSource[i], 1));
                }
            }
        };
        return Lexer;
    })();
    Combobiler.Lexer = Lexer;
})(Combobiler || (Combobiler = {}));
