///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
///<reference path="lexer.ts" />
///<reference path="scope.ts" />
///<reference path="scope_node.ts" />
var Combobiler;
(function (Combobiler) {
    var Parser = (function () {
        function Parser(tokens) {
            // Define some default logger options for the parser
            this.loggerOptions = {
                type: 'parser',
                header: 'Parser'
            };
            // We'll keep reference to the "current scope"
            // We will instantiate it with a blank Scope instance
            this.currentScope = new Combobiler.Scope({}, null);
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
                try  {
                    this.parseProgram();
                    this.log({
                        standard: '==== Parse end ====',
                        sarcastic: '==== Parse end ===='
                    });
                } catch (error) {
                    this.error({
                        standard: error,
                        sarcastic: error
                    });

                    this.error({
                        standard: '==== Parse ended due to error ====',
                        sarcastic: '==== Parse ended due to error ===='
                    });
                }
            }
        };

        Parser.prototype.parseProgram = function () {
            this.parseBlock(this.getNextToken());
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

        Parser.prototype.parseBlock = function (token) {
            this.assertToken(token, Combobiler.OpenBrace);

            // Opening up a new block denotes a new scope
            // We will set the current scope to the newly instantiated Scope instance
            // which sets its parent attribute to the last current scope
            this.currentScope = new Combobiler.Scope({}, this.currentScope);
            this.log({
                standard: 'Opening up a new scope block on line ' + token.line,
                sarcastic: 'Opening up a new scope block on line ' + token.line
            });
            var startLine = token.line;
            this.parseStatementList();
            token = this.getNextToken();
            this.assertToken(token, Combobiler.CloseBrace);

            // Log the block scope, if there was anything in there
            if (Object.keys(this.currentScope.getSymbols()).length > 0) {
                this.log({
                    standard: 'The scope block being closed held the following info ' + this.currentScope.toString(),
                    sarcastic: 'The scope block being closed held the following info ' + this.currentScope.toString()
                });
            }

            // At this point, the block is closed, therefore we can move the currentScope
            // pointer back to the currentScope's parent.
            this.currentScope = this.currentScope.getParent();
            this.log({
                standard: 'Parsed a block that started on line ' + startLine + ' and ended on line ' + token.line,
                sarcastic: 'I don\'t have something sarcastic to say, but yay we parsed a block on line ' + startLine + ' and ended on line ' + token.line
            });
        };

        Parser.prototype.parseStatementList = function () {
            while (!(this.peekNextToken() instanceof Combobiler.CloseBrace)) {
                var token = this.getNextToken();

                if (token instanceof Combobiler.Print) {
                    this.parsePrintStatement(token);
                } else if (token instanceof Combobiler.VariableIdentifier && this.peekNextToken() instanceof Combobiler.Assignment) {
                    this.parseAssignmentStatement(token);
                } else if (token instanceof Combobiler.Int || token instanceof Combobiler.String || token instanceof Combobiler.Boolean) {
                    this.parseVariableDeclaration(token);
                } else if (token instanceof Combobiler.While) {
                    this.parseWhileStatement(token);
                } else if (token instanceof Combobiler.If) {
                    this.parseIfStatement(token);
                } else if (token instanceof Combobiler.OpenBrace) {
                    this.parseBlock(token);
                } else {
                    this.error({
                        standard: 'Tried to parse statement list, but could not find valid statement on line ' + token.line,
                        sarcastic: 'Why do you even program if you can\'t get a simple statement correct on line ' + token.line
                    });
                }
            }
        };

        Parser.prototype.parsePrintStatement = function (token) {
            this.assertToken(token, Combobiler.Print);
            this.assertToken(this.getNextToken(), Combobiler.LParen);
            this.parseExpression(this.getNextToken());
            this.assertToken(this.getNextToken(), Combobiler.RParen);
            this.log({
                standard: 'Parsed a print statement on line ' + token.line,
                sarcastic: 'Parsed a print statement on line ' + token.line
            });
        };

        Parser.prototype.parseAssignmentStatement = function (token) {
            // Capture some variables so we can add to the symbol table/scope blocks
            var varId = token;
            this.assertToken(varId, Combobiler.VariableIdentifier);
            this.assertToken(this.getNextToken(), Combobiler.Assignment);
            var exprToken = this.getNextToken();
            var value = this.parseExpression(exprToken);

            var possibleSymbol = this.currentScope.findSymbol(varId.value);

            if (possibleSymbol == null) {
                throw new Error('Can not assign value to undeclared variable ' + varId.value + ' on line ' + varId.line);
            }
            var node;

            if (exprToken instanceof Combobiler.IntValue && possibleSymbol.getType() == 'int') {
                // Create a test variable that we know is of type number
                var numberTestType = 1;

                // Assert that the type is a number, since this is a statically typed language
                this.assertType(value, numberTestType);
                node = new Combobiler.ScopeNode(value, 'int');
            } else if (exprToken instanceof Combobiler.StringValue && possibleSymbol.getType() == 'string') {
                // Create a test variable that we know is of type String
                var stringTestType = "test";

                // Assert that the type is a string, since this is a statically typed language
                this.assertType(value, stringTestType);
                node = new Combobiler.ScopeNode(value, 'string');
            } else if ((exprToken instanceof Combobiler.True || exprToken instanceof Combobiler.False) && possibleSymbol.getType() == 'boolean') {
                // Create a test variable that we know is of type boolean
                var booleanTestType = true;

                // Assert that the type is a boolean, since this is a statically typed language
                this.assertType(value, booleanTestType);
                node = new Combobiler.ScopeNode(value, 'bool');
            } else {
                throw new Error('Type mismatch. Expected ' + possibleSymbol.getType() + ' on line ' + varId.line);
            }
            this.currentScope.addSymbol(varId.value, node);
            this.log({
                standard: 'Symbol ' + varId.value + ' was assigned value ' + node.getValue() + ' in symbol table',
                sarcastic: 'Symbol ' + varId.value + ' was assigned value ' + node.getValue() + ' in symbol table'
            });
            this.log({
                standard: 'Parsed assignment statement on line ' + token.line,
                sarcastic: 'Parsed assignment statement on line ' + token.line
            });
        };

        Parser.prototype.parseExpression = function (token) {
            if (token instanceof Combobiler.IntValue) {
                return this.parseIntExpression(token);
            } else if (token instanceof Combobiler.StringValue) {
                return this.parseStringExpression(token);
            } else if (token instanceof Combobiler.Boolean || token instanceof Combobiler.True || token instanceof Combobiler.False) {
                return this.parseBooleanExpression(token);
            } else if (token instanceof Combobiler.VariableIdentifier) {
                this.parseId(token);
            } else {
                throw new Error('Error while parsing expression on line ' + token.line);
            }
        };

        Parser.prototype.parseIntExpression = function (token) {
            var resultValue = +token.value;
            this.assertToken(token, Combobiler.IntValue);
            if (this.peekNextToken() instanceof Combobiler.Plus) {
                this.assertToken(this.getNextToken(), Combobiler.Plus);
                var nextToken = this.getNextToken();
                this.parseExpression(nextToken);
                resultValue += +nextToken.value;
            }
            this.log({
                standard: 'Parsed int expression on line ' + token.line,
                sarcastic: 'Parsed int expression on line ' + token.line
            });
            return +resultValue;
        };

        Parser.prototype.parseStringExpression = function (token) {
            this.assertToken(token, Combobiler.StringValue);
            this.log({
                standard: 'Parsed string expression on line ' + token.line,
                sarcastic: 'Parsed string expression on line ' + token.line
            });
            return token.value;
        };

        Parser.prototype.parseBooleanExpression = function (token) {
            var resultValue;
            if (token instanceof Combobiler.LParen) {
                this.assertToken(token, Combobiler.LParen);
                this.parseExpression(this.getNextToken());
                this.assertTokenInSet(this.getNextToken(), [Combobiler.Equality, Combobiler.NonEquality]);
                this.parseExpression(this.getNextToken());
                this.assertToken(this.getNextToken(), Combobiler.RParen);
            } else if (token instanceof Combobiler.False || token instanceof Combobiler.True) {
                this.assertTokenInSet(token, [Combobiler.False, Combobiler.True]);

                // Needs to return a JS bool value from this function
                resultValue = token instanceof Combobiler.True;
            } else {
                throw new Error('Not a valid Boolean Expression');
            }
            this.log({
                standard: 'Parsed boolean expression statement on line ' + token.line,
                sarcastic: 'Parsed boolean expression statement on line ' + token.line
            });
            return resultValue;
        };

        Parser.prototype.parseId = function (token) {
            this.assertToken(token, Combobiler.VariableIdentifier);
            this.log({
                standard: 'Parsed ID on line ' + token.line,
                sarcastic: 'Parsed ID on line ' + token.line
            });
        };

        Parser.prototype.parseVariableDeclaration = function (token) {
            var node = new Combobiler.ScopeNode(null, token.symbol);
            this.assertTokenInSet(token, [Combobiler.String, Combobiler.Int, Combobiler.Boolean]);
            token = this.getNextToken();
            this.parseId(token);
            this.currentScope.addSymbol(token.value, node);
            this.log({
                standard: 'Added symbol ' + token.value + ' of type ' + node.getType() + ' to symbol table',
                sarcastic: 'Added symbol ' + token.value + ' of type ' + node.getType() + ' to symbol table'
            });
            this.log({
                standard: 'Parsed variable declaration statement on line ' + token.line,
                sarcastic: 'Parsed variable declaration statement on line ' + token.line
            });
        };

        Parser.prototype.parseWhileStatement = function (token) {
            this.assertToken(token, Combobiler.While);
            this.parseBooleanExpression(this.getNextToken());
            this.parseBlock(this.getNextToken());
            this.log({
                standard: 'Parsed while statement on line ' + token.line,
                sarcastic: 'Parsed while statement on line ' + token.line
            });
        };

        Parser.prototype.parseIfStatement = function (token) {
            this.assertToken(token, Combobiler.If);
            this.parseBooleanExpression(this.getNextToken());
            this.parseBlock(this.getNextToken());
            this.log({
                standard: 'Parsing if statement on line ' + token.line,
                sarcastic: 'Parsing if statement on line ' + token.line
            });
        };

        Parser.prototype.peekNextToken = function () {
            return this.tokens[this.current + 1];
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

        Parser.prototype.assertType = function (val, type) {
            if (typeof val == typeof type) {
                return true;
            } else {
                throw new Error('Expected ' + typeof type + ' but got ' + typeof val + ' instead');
            }
        };

        Parser.prototype.assertToken = function (token, type) {
            if (token instanceof type) {
                return true;
            } else {
                throw new Error('Expected ' + type.symbol + ' but got ' + token.symbol + ' instead');
            }
        };

        Parser.prototype.assertTokenInSet = function (token, types) {
            var found = false;
            for (var t in types) {
                if (token instanceof types[t]) {
                    found = true;
                    break;
                }
            }
            if (found) {
                return true;
            } else {
                var expectedString = '';
                for (var t in types) {
                    expectedString += types[t].symbol + ', ';
                }
                throw new Error('Expected one of the following(' + expectedString + ') but got ' + token.symbol + ' instead');
            }
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
