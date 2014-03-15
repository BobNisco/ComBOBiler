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
            this.log({
                standard: '==== Lexical Analysis Start ====',
                sarcastic: '==== Lexical Analysis Start ===='
            });

            // Our return (strongly-typed in TypeScript) array of Tokens
            var tokenStream = new Array();

            try  {
                lexLoop:
                for (var line = 0; line < splitSource.length; line++) {
                    var currentLine = splitSource[line];

                    // Split each part of the line up by var ids, ints, strings, (non)equality, and anything else
                    var splitLine = currentLine.match(/([a-z]+)|(^0$|^[1-9]\d*$)|("[^"]*")|(!=)|(==)|(\S)/g);

                    // The splitLine will be null if we have a blank line, so we'll just skip over that
                    if (splitLine !== null) {
                        for (var i = 0; i < splitLine.length; i++) {
                            var current = splitLine[i];
                            if (current !== '') {
                                var newToken = Combobiler.Token.makeNewToken(current, line + 1);
                                if (newToken != null) {
                                    tokenStream.push(newToken);
                                    this.log({
                                        standard: 'Found token ' + newToken.toString(),
                                        sarcastic: 'Cool, a token ' + newToken.toString() + ' but who cares?'
                                    });
                                    if (newToken instanceof Combobiler.EndBlock && (splitLine[i + 1] != null || splitSource[line + 1] != null)) {
                                        this.log({
                                            standard: 'Reached end of program, ignoring rest of input',
                                            sarcastic: 'Reached end of program, ignoring rest of input'
                                        });
                                        break lexLoop;
                                    }
                                } else {
                                    throw new Error('Lexical error: ' + current + ' on line ' + (line + 1));
                                }
                            }
                        }
                    }
                }
                if (tokenStream.length > 0 && !(tokenStream[tokenStream.length - 1] instanceof Combobiler.EndBlock)) {
                    this.log({
                        standard: 'Missing $ at end of program. Inserting one for you',
                        sarcastic: 'Nice job, forgetting $ at end of program. You\'re lucky that I\'m smart enough to do this for you'
                    });
                    tokenStream.push(Combobiler.Token.makeNewToken('$', splitSource.length + 1));
                    $('#taSourceCode').val(this.source + ' $');
                }
                this.log({
                    standard: '==== Lexical Analysis End ====',
                    sarcastic: '==== Lexical Analysis End ===='
                });
            } catch (error) {
                this.error({
                    standard: error,
                    sarcastic: error
                });
                this.error({
                    standard: '==== Lexical Analysis Ended Due To Error ====',
                    sarcastic: '==== Lexical Analysis Ended Due To Error ===='
                });

                // Just return an empty array since we didn't lex properly
                return new Array();
            }
            return tokenStream;
        };

        /**
        * Internal handler for passing our log message to the logger. This method should
        * be used for non-errors in the lexer.
        *
        * @param message the text to be put into the output field
        */
        Lexer.prototype.log = function (messages) {
            LOGGER.log($.extend({ displayClass: 'label-info' }, this.loggerOptions), messages);
        };

        /**
        * Internal handler for passsing our error message to the logger. This method
        * should be used for errors in the lexer.
        *
        * @param message the text to be put into the output field
        */
        Lexer.prototype.error = function (messages) {
            LOGGER.log($.extend({ displayClass: 'label-danger' }, this.loggerOptions), messages);
        };
        return Lexer;
    })();
    Combobiler.Lexer = Lexer;
})(Combobiler || (Combobiler = {}));
