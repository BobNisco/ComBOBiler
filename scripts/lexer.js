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

            // Our return (strongly-typed in TypeScript) array of Tokens
            var tokenStream = new Array();

            for (var i in splitSource) {
                var current = splitSource[i];
                if (current !== '') {
                    var needToAdvanceLine = false;

                    // Check if we need to advance the current line that we're on
                    if (regExForNewLine.exec(current)) {
                        needToAdvanceLine = true;

                        // Strip the newline character from the current node so that
                        // we can match it properly in the makeNewToken function
                        current = current.replace(regExForNewLine, '');
                    }
                    tokenStream.push(Combobiler.Token.makeNewToken(current, this.currentLine));

                    // Advance the line AFTER we're done lexing
                    if (needToAdvanceLine) {
                        this.currentLine += 1;
                    }
                }
            }
            return tokenStream;
        };
        return Lexer;
    })();
    Combobiler.Lexer = Lexer;
})(Combobiler || (Combobiler = {}));
