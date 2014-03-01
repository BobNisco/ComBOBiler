///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
///<reference path="lexer.ts" />
var Combobiler;
(function (Combobiler) {
    var Parser = (function () {
        function Parser(tokens) {
            // Define some default logger options for the parser
            this.loggerOptions = {
                type: 'parser',
                header: 'Parser'
            };
            this.tokens = tokens;
            this.current = -1;
        }
        Parser.prototype.performParse = function () {
            this.log({
                standard: '==== Parse start ====',
                sarcastic: '==== Parse start ===='
            });
            if (this.tokens.length <= 0) {
                this.error({
                    standard: 'No tokens found, can\'t parse anything!',
                    sarcastic: 'What the hell am I supposed to do without a single token?'
                });
            } else {
                this.parseProgram();
            }
            this.log({
                standard: '==== Parse end ====',
                sarcastic: '==== Parse end ===='
            });
        };

        Parser.prototype.parseProgram = function () {
            this.parseBlock();
            var token = this.getNextToken();
            if (token instanceof Combobiler.EndBlock) {
                this.log({
                    standard: 'Hooray! We parsed your program!',
                    sarcastic: 'Your program is parsed, but please don\'t make me do more. I\'m tired.'
                });
            } else {
                this.error({
                    standard: 'Error while parsing block. Expected end program symbol "$", but got ' + token.symbol + ' on line ' + token.line,
                    sarcastic: 'Do you do anything right? I\'m trying to finish parsing your program, but got ' + token.symbol + ' on line ' + token.line
                });
            }
        };

        Parser.prototype.parseBlock = function () {
            var token = this.getNextToken();
            if (token instanceof Combobiler.OpenBrace) {
                var startLine = token.line;
                this.parseStatementList();
                token = this.getNextToken();
                if (token instanceof Combobiler.CloseBrace) {
                    var endLine = token.line;
                    this.log({
                        standard: 'Parsed a block that started on line ' + startLine + ' and ended on ' + endLine,
                        sarcastic: 'I don\'t have something sarcastic to say, but yay we parsed a block on line ' + startLine + ' and ended on ' + endLine
                    });
                }
            } else {
                this.error({
                    standard: 'Error while parsing block. Expected open brace "{", but got ' + token.symbol + ' on line ' + token.line,
                    sarcastic: 'Oh great, another error by you. This time it happened on line ' + token.line + ' but I\'ll leave it up to you to figure the rest out'
                });
            }
        };

        Parser.prototype.parseStatementList = function () {
        };

        Parser.prototype.getNextToken = function () {
            var token = this.tokens[++this.current];
            if (token == null) {
                this.error({
                    standard: 'Ran out of tokens, even though we were expecting more',
                    sarcastic: 'Ran out of tokens, phew, I was tired anyway'
                });
            }
            return token;
        };

        /**
        * Internal handler for passing our log message to the logger. This method should
        * be used for non-errors in the parser.
        *
        * @param message the text to be put into the output field
        */
        Parser.prototype.log = function (messages) {
            LOGGER.log($.extend({ displayClass: 'label-info' }, this.loggerOptions), messages);
        };

        /**
        * Internal handler for passsing our error message to the logger. This method
        * should be used for errors in the parser.
        *
        * @param message the text to be put into the output field
        */
        Parser.prototype.error = function (messages) {
            LOGGER.log($.extend({ displayClass: 'label-danger' }, this.loggerOptions), messages);
        };
        return Parser;
    })();
    Combobiler.Parser = Parser;
})(Combobiler || (Combobiler = {}));
