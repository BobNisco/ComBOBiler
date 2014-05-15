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
                throw new Error('No tokens found, can\'t parse anything!');
            } else {
                try  {
                    this.parseProgram(this.rootNode);
                    this.log({
                        standard: '==== Parse end ====',
                        sarcastic: '==== Parse end ===='
                    });
                    return {
                        rootNode: this.rootNode
                    };
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

        Parser.prototype.parseProgram = function (node) {
            this.rootNode = new Combobiler.TreeNode('Program', null);
            node = this.rootNode;

            this.parseBlock(node, this.getNextToken());
            var token = this.getNextToken();
            if (token instanceof Combobiler.EndBlock) {
                node.addChildNode('$');

                //this.makeNewChildNode(node, '$');
                this.log({
                    standard: 'Hooray! We parsed your program!',
                    sarcastic: 'Your program is parsed, but please don\'t make me do more. I\'m tired.'
                });
            } else {
                throw new Error('Error while parsing block. Expected end program symbol "$", but got ' + token.symbol + ' on line ' + token.line);
            }
        };

        Parser.prototype.parseBlock = function (node, token) {
            node.addChildNode('Block');

            // Set the "current node" to be the new block node
            node = node.getNewestChild();

            this.assertToken(token, Combobiler.OpenBrace);
            node.addChildNode(token);

            var startLine = token.line;
            this.parseStatementList(node);

            token = this.getNextToken();
            this.assertToken(token, Combobiler.CloseBrace);
            node.addChildNode(token);
            this.log({
                standard: 'Parsed a block that started on line ' + startLine + ' and ended on line ' + token.line,
                sarcastic: 'I don\'t have something sarcastic to say, but yay we parsed a block on line ' + startLine + ' and ended on line ' + token.line
            });
        };

        Parser.prototype.parseStatementList = function (node) {
            while (!(this.peekNextToken() instanceof Combobiler.CloseBrace)) {
                node.addChildNode('StatementList');
                node = node.getNewestChild();

                var token = this.getNextToken();

                if (token instanceof Combobiler.Print) {
                    this.parsePrintStatement(node, token);
                } else if (token instanceof Combobiler.VariableIdentifier && this.peekNextToken() instanceof Combobiler.Assignment) {
                    this.parseAssignmentStatement(node, token);
                } else if (token instanceof Combobiler.Int || token instanceof Combobiler.MyString || token instanceof Combobiler.Boolean) {
                    this.parseVariableDeclaration(node, token);
                } else if (token instanceof Combobiler.While) {
                    this.parseWhileStatement(node, token);
                } else if (token instanceof Combobiler.If) {
                    this.parseIfStatement(node, token);
                } else if (token instanceof Combobiler.OpenBrace) {
                    this.parseBlock(node, token);
                } else {
                    throw new Error('Tried to parse statement list, but could not find valid statement on line ' + token.line);
                }
            }
        };

        Parser.prototype.parsePrintStatement = function (node, token) {
            // Make a new PrintStatement Node
            node.addChildNode('PrintStatement');
            node = node.getNewestChild();

            this.assertToken(token, Combobiler.Print);
            node.addChildNode(token);

            token = this.getNextToken();
            this.assertToken(token, Combobiler.LParen);
            node.addChildNode(token);

            // RECURSE!
            this.parseExpression(node, this.getNextToken());

            token = this.getNextToken();
            this.assertToken(token, Combobiler.RParen);
            node.addChildNode(token);

            this.log({
                standard: 'Parsed a print statement on line ' + token.line,
                sarcastic: 'Parsed a print statement on line ' + token.line
            });
        };

        Parser.prototype.parseAssignmentStatement = function (node, token) {
            node.addChildNode('AssignmentStatement');
            node = node.getNewestChild();

            // Capture some variables
            var varId = token;

            this.assertToken(varId, Combobiler.VariableIdentifier);
            node.addChildNode(varId);

            token = this.getNextToken();
            this.assertToken(token, Combobiler.Assignment);
            node.addChildNode(token);

            var exprToken = this.getNextToken();
            var value = this.parseExpression(node, exprToken);

            this.log({
                standard: 'Parsed assignment statement on line ' + token.line,
                sarcastic: 'Parsed assignment statement on line ' + token.line
            });
        };

        Parser.prototype.parseExpression = function (node, token) {
            node.addChildNode('Expression');
            node = node.getNewestChild();

            if (token instanceof Combobiler.IntValue) {
                return this.parseIntExpression(node, token);
            } else if (token instanceof Combobiler.StringValue) {
                return this.parseStringExpression(node, token);
            } else if (token instanceof Combobiler.Boolean || token instanceof Combobiler.True || token instanceof Combobiler.False || token instanceof Combobiler.LParen) {
                return this.parseBooleanExpression(node, token);
            } else if (token instanceof Combobiler.VariableIdentifier) {
                this.parseId(node, token);
            } else {
                throw new Error('Error while parsing expression on line ' + token.line);
            }
        };

        Parser.prototype.parseIntExpression = function (node, token) {
            node.addChildNode('IntExpression');
            node = node.getNewestChild();

            var resultValue = +token.value;
            this.assertToken(token, Combobiler.IntValue);
            node.addChildNode(token);

            if (this.peekNextToken() instanceof Combobiler.Plus) {
                token = this.getNextToken();
                this.assertToken(token, Combobiler.Plus);
                node.addChildNode(token);

                token = this.getNextToken();
                this.parseExpression(node, token);
                resultValue += +token.value;
            }
            this.log({
                standard: 'Parsed int expression on line ' + token.line,
                sarcastic: 'Parsed int expression on line ' + token.line
            });
            return +resultValue;
        };

        Parser.prototype.parseStringExpression = function (node, token) {
            node.addChildNode('StringExpression');
            node = node.getNewestChild();

            this.assertToken(token, Combobiler.StringValue);
            node.addChildNode(token);

            this.log({
                standard: 'Parsed string expression on line ' + token.line,
                sarcastic: 'Parsed string expression on line ' + token.line
            });
            return token.value;
        };

        Parser.prototype.parseBooleanExpression = function (node, token) {
            node.addChildNode('BooleanExpression');
            node = node.getNewestChild();

            var resultValue;
            if (token instanceof Combobiler.LParen) {
                this.assertToken(token, Combobiler.LParen);
                node.addChildNode(token);

                this.parseExpression(node, this.getNextToken());
                token = this.getNextToken();
                this.assertTokenInSet(token, [Combobiler.Equality, Combobiler.NonEquality]);
                node.addChildNode(token);

                this.parseExpression(node, this.getNextToken());

                token = this.getNextToken();
                this.assertToken(token, Combobiler.RParen);
                node.addChildNode(token);
            } else if (token instanceof Combobiler.False || token instanceof Combobiler.True) {
                this.assertTokenInSet(token, [Combobiler.False, Combobiler.True]);
                node.addChildNode(token);

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

        Parser.prototype.parseId = function (node, token) {
            node.addChildNode('Id');
            node = node.getNewestChild();

            this.assertToken(token, Combobiler.VariableIdentifier);
            node.addChildNode(token);
            this.log({
                standard: 'Parsed ID on line ' + token.line,
                sarcastic: 'Parsed ID on line ' + token.line
            });
        };

        Parser.prototype.parseVariableDeclaration = function (node, token) {
            node.addChildNode('VarDecl');
            node = node.getNewestChild();

            this.assertTokenInSet(token, [Combobiler.MyString, Combobiler.Int, Combobiler.Boolean]);
            node.addChildNode(token);

            token = this.getNextToken();
            this.parseId(node, token);
            node.addChildNode(token);

            this.log({
                standard: 'Parsed variable declaration statement on line ' + token.line,
                sarcastic: 'Parsed variable declaration statement on line ' + token.line
            });
        };

        Parser.prototype.parseWhileStatement = function (node, token) {
            node.addChildNode('WhileStatement');
            node = node.getNewestChild();

            this.assertToken(token, Combobiler.While);
            node.addChildNode(token);

            this.parseBooleanExpression(node, this.getNextToken());
            this.parseBlock(node, this.getNextToken());
            this.log({
                standard: 'Parsed while statement on line ' + token.line,
                sarcastic: 'Parsed while statement on line ' + token.line
            });
        };

        Parser.prototype.parseIfStatement = function (node, token) {
            node.addChildNode('IfStatement');
            node = node.getNewestChild();

            this.assertToken(token, Combobiler.If);
            node.addChildNode(token);

            this.parseBooleanExpression(node, this.getNextToken());
            this.parseBlock(node, this.getNextToken());
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
                throw new Error('Ran out of tokens, even though we were expecting more');
            }
            return token;
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
