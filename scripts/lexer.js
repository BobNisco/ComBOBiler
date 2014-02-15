///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
var Combobiler;
(function (Combobiler) {
    var Lexer = (function () {
        function Lexer(s) {
            // Define some default logger options for the lexer
            this.loggerOptions = {
                type: 'lex',
                header: 'Lexer'
            };
            this.source = $.trim(s);
        }
        Lexer.prototype.performLexicalAnalysis = function () {
            // Split the source code by lines
            var splitSource = this.source.split('\n');
            this.log('==== Lexical Analysis Start ====');

            // Our return (strongly-typed in TypeScript) array of Tokens
            var tokenStream = new Array();

            for (var line = 0; line < splitSource.length; line++) {
                var currentLine = splitSource[line];

                // Split each part of the line up by spaces
                var splitLine = currentLine.split(' ');

                for (var i = 0; i < splitLine.length; i++) {
                    var current = splitLine[i];
                    if (current !== '') {
                        var newToken = Combobiler.Token.makeNewToken(current, line + 1);
                        if (newToken != null) {
                            tokenStream.push(newToken);
                            this.log('Found token ' + newToken.toString());
                        } else {
                            this.error('Lexical error: ' + current + ' on line ' + line + 1);
                        }
                    }
                }
            }
            this.log('==== Lexical Analysis End ====');
            return tokenStream;
        };

        /**
        * Internal handler for passing our log message to the logger. This method should
        * be used for non-errors in the lexer.
        *
        * @param message the text to be put into the output field
        */
        Lexer.prototype.log = function (message) {
            LOGGER.log($.extend({ displayClass: 'label-info' }, this.loggerOptions), message);
        };

        /**
        * Internal handler for passsing our error message to the logger. This method
        * should be used for errors in the lexer.
        *
        * @param message the text to be put into the output field
        */
        Lexer.prototype.error = function (message) {
            LOGGER.log($.extend({ displayClass: 'label-danger' }, this.loggerOptions), message);
        };
        return Lexer;
    })();
    Combobiler.Lexer = Lexer;
})(Combobiler || (Combobiler = {}));
