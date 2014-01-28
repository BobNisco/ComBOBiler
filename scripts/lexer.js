///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
var Combobiler;
(function (Combobiler) {
    var Lexer = (function () {
        function Lexer(s) {
            this.currentLine = 1;
            this.source = $.trim(s);
        }
        Lexer.prototype.performLexicalAnalysis = function () {
            var regExForNewLine = /\r|\n/;

            // Split the source code by spaces
            var splitSource = this.source.split(' ');
            LOGGER.headerInfo('Lexical Analysis Start');
            console.log(splitSource);
            for (var i in splitSource) {
                var current = splitSource[i];
                if (current !== '') {
                    // Check if we need to advance the current line that we're on
                    if (regExForNewLine.exec(current)) {
                        this.currentLine += 1;
                    }
                    console.log(Combobiler.Token.makeNewToken(splitSource[i], this.currentLine));
                }
            }
        };
        return Lexer;
    })();
    Combobiler.Lexer = Lexer;
})(Combobiler || (Combobiler = {}));
