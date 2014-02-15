var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Combobiler;
(function (Combobiler) {
    var Token = (function () {
        // TypeScript (like JS) does not have a difference between
        // an integer or a float/double.
        function Token(symbol, line) {
            this.symbol = symbol;
            this.line = line;
        }
        Token.prototype.toString = function () {
            return this.symbol + ' on line ' + this.line;
        };

        /**
        * A function that will return a new Token of the proper subclass
        * depending on what symbol was passed in to it.
        *
        * @param symbol the string of characters that we are attempting to
        *        match against
        * @param line the line number in which the symbol was found
        */
        Token.makeNewToken = function (symbol, line) {
            var possibleToken = Token.symbolMapping(symbol, line);
            if (possibleToken !== undefined) {
                return possibleToken;
            }

            if (Token.intRegex.exec(symbol)) {
                return new IntValue(line, symbol);
            } else if (Token.stringRegex.exec(symbol)) {
                return new StringValue(line, symbol);
            } else if (/(\bprint\b)(\()([A-Za-z][A-Za-z0-9]*)(\))/.exec(symbol)) {
                var match = /(\bprint\b)(\()([A-Za-z][A-Za-z0-9]*)(\))/.exec(symbol);

                // Pass what's in between the parenthesis as a parameter
                return new Print(line, match[3]);
            } else if (Token.identifierRegex.exec(symbol)) {
                return new VariableIdentifier(line, symbol);
            } else {
                // TODO: Handle errors better
                return null;
            }
        };
        Token.numberRegex = /^\d+$/;
        Token.alphaNumRegexString = "[A-Za-z0-9]*";
        Token.stringRegex = /(\")[A-Za-z][A-Za-z0-9]*(\")/;
        Token.identifierRegex = new RegExp("[A-Za-z]" + Token.alphaNumRegexString);
        Token.intRegex = /0|[1-9]+\d*/;

        Token.symbolMapping = function (symbol, line) {
            // Make an associative array where the keys are the reserved symbols
            // and the value is an anonymous, self-invoking function that returns
            // the proper Token
            var tokens = {
                'while': function () {
                    return new While(line);
                }(),
                '(': function () {
                    return new LParen(line);
                }(),
                ')': function () {
                    return new RParen(line);
                }(),
                '<': function () {
                    return new LessThan(line);
                }(),
                '>': function () {
                    return new GreaterThan(line);
                }(),
                '{': function () {
                    return new OpenBrace(line);
                }(),
                '}': function () {
                    return new CloseBrace(line);
                }(),
                '=': function () {
                    return new Assignment(line);
                }(),
                '+': function () {
                    return new Plus(line);
                }(),
                '-': function () {
                    return new Minus(line);
                }(),
                ';': function () {
                    return new Semicolon(line);
                }(),
                'true': function () {
                    return new True(line);
                }(),
                'false': function () {
                    return new False(line);
                }(),
                'int': function () {
                    return new Int(line);
                }(),
                'if': function () {
                    return new If(line);
                }(),
                'string': function () {
                    return new String(line);
                }(),
                'boolean': function () {
                    return new Boolean(line);
                }(),
                '==': function () {
                    return new Equality(line);
                }(),
                '!=': function () {
                    return new NonEquality(line);
                }(),
                '$': function () {
                    return new EndBlock(line);
                }()
            };
            return tokens[symbol];
        };
        return Token;
    })();
    Combobiler.Token = Token;

    var While = (function (_super) {
        __extends(While, _super);
        function While(line) {
            _super.call(this, 'while', line);
        }
        return While;
    })(Token);
    Combobiler.While = While;

    var LParen = (function (_super) {
        __extends(LParen, _super);
        function LParen(line) {
            _super.call(this, '(', line);
        }
        return LParen;
    })(Token);
    Combobiler.LParen = LParen;

    var RParen = (function (_super) {
        __extends(RParen, _super);
        function RParen(line) {
            _super.call(this, ')', line);
        }
        return RParen;
    })(Token);
    Combobiler.RParen = RParen;

    var LessThan = (function (_super) {
        __extends(LessThan, _super);
        function LessThan(line) {
            _super.call(this, '<', line);
        }
        return LessThan;
    })(Token);
    Combobiler.LessThan = LessThan;

    var GreaterThan = (function (_super) {
        __extends(GreaterThan, _super);
        function GreaterThan(line) {
            _super.call(this, '>', line);
        }
        return GreaterThan;
    })(Token);
    Combobiler.GreaterThan = GreaterThan;

    var OpenBrace = (function (_super) {
        __extends(OpenBrace, _super);
        function OpenBrace(line) {
            _super.call(this, '{', line);
        }
        return OpenBrace;
    })(Token);
    Combobiler.OpenBrace = OpenBrace;

    var CloseBrace = (function (_super) {
        __extends(CloseBrace, _super);
        function CloseBrace(line) {
            _super.call(this, '}', line);
        }
        return CloseBrace;
    })(Token);
    Combobiler.CloseBrace = CloseBrace;

    var Assignment = (function (_super) {
        __extends(Assignment, _super);
        function Assignment(line) {
            _super.call(this, '=', line);
        }
        return Assignment;
    })(Token);
    Combobiler.Assignment = Assignment;

    var Plus = (function (_super) {
        __extends(Plus, _super);
        function Plus(line) {
            _super.call(this, '+', line);
        }
        return Plus;
    })(Token);
    Combobiler.Plus = Plus;

    var Minus = (function (_super) {
        __extends(Minus, _super);
        function Minus(line) {
            _super.call(this, '-', line);
        }
        return Minus;
    })(Token);
    Combobiler.Minus = Minus;

    var Semicolon = (function (_super) {
        __extends(Semicolon, _super);
        function Semicolon(line) {
            _super.call(this, ';', line);
        }
        return Semicolon;
    })(Token);
    Combobiler.Semicolon = Semicolon;

    var True = (function (_super) {
        __extends(True, _super);
        function True(line) {
            _super.call(this, 'true', line);
        }
        return True;
    })(Token);
    Combobiler.True = True;

    var False = (function (_super) {
        __extends(False, _super);
        function False(line) {
            _super.call(this, 'false', line);
        }
        return False;
    })(Token);
    Combobiler.False = False;

    var Int = (function (_super) {
        __extends(Int, _super);
        function Int(line) {
            _super.call(this, 'int', line);
        }
        return Int;
    })(Token);
    Combobiler.Int = Int;

    var If = (function (_super) {
        __extends(If, _super);
        function If(line) {
            _super.call(this, 'if', line);
        }
        return If;
    })(Token);
    Combobiler.If = If;

    var String = (function (_super) {
        __extends(String, _super);
        function String(line) {
            _super.call(this, 'string', line);
        }
        return String;
    })(Token);
    Combobiler.String = String;

    var Boolean = (function (_super) {
        __extends(Boolean, _super);
        function Boolean(line) {
            _super.call(this, 'boolean', line);
        }
        return Boolean;
    })(Token);
    Combobiler.Boolean = Boolean;

    var Equality = (function (_super) {
        __extends(Equality, _super);
        function Equality(line) {
            _super.call(this, '==', line);
        }
        return Equality;
    })(Token);
    Combobiler.Equality = Equality;

    var NonEquality = (function (_super) {
        __extends(NonEquality, _super);
        function NonEquality(line) {
            _super.call(this, '!=', line);
        }
        return NonEquality;
    })(Token);
    Combobiler.NonEquality = NonEquality;

    var EndBlock = (function (_super) {
        __extends(EndBlock, _super);
        function EndBlock(line) {
            _super.call(this, '$', line);
        }
        return EndBlock;
    })(Token);
    Combobiler.EndBlock = EndBlock;

    /**
    * A subclass of the Token object meant for tokens who need to
    * store a value in them.
    */
    var ValueToken = (function (_super) {
        __extends(ValueToken, _super);
        function ValueToken(symbol, line, value) {
            _super.call(this, symbol, line);
            this.value = value;
        }
        ValueToken.prototype.toString = function () {
            return this.symbol + '(' + this.value + ') on line ' + this.line;
        };
        return ValueToken;
    })(Token);
    Combobiler.ValueToken = ValueToken;

    var VariableIdentifier = (function (_super) {
        __extends(VariableIdentifier, _super);
        function VariableIdentifier(line, value) {
            _super.call(this, 'varid', line, value);
        }
        return VariableIdentifier;
    })(ValueToken);
    Combobiler.VariableIdentifier = VariableIdentifier;

    var StringValue = (function (_super) {
        __extends(StringValue, _super);
        function StringValue(line, value) {
            _super.call(this, 'string value', line, value);
        }
        return StringValue;
    })(ValueToken);
    Combobiler.StringValue = StringValue;

    var IntValue = (function (_super) {
        __extends(IntValue, _super);
        function IntValue(line, value) {
            _super.call(this, 'int value', line, value);
        }
        return IntValue;
    })(ValueToken);
    Combobiler.IntValue = IntValue;

    var Print = (function (_super) {
        __extends(Print, _super);
        function Print(line, value) {
            _super.call(this, 'print', line, value);
        }
        return Print;
    })(ValueToken);
    Combobiler.Print = Print;

    var Char = (function (_super) {
        __extends(Char, _super);
        function Char(line, value) {
            _super.call(this, 'char', line, value);
        }
        return Char;
    })(ValueToken);
    Combobiler.Char = Char;
})(Combobiler || (Combobiler = {}));
