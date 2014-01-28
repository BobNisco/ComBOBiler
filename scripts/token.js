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
        Token.makeNewToken = function (symbol, line) {
            if (symbol == 'while') {
                return new While(line);
            } else if (symbol == '(') {
                return new LParen(line);
            } else if (symbol == ')') {
                return new RParen(line);
            } else if (symbol == '<') {
                return new LessThan(line);
            } else if (symbol == '>') {
                return new GreaterThan(line);
            } else if (symbol == '{') {
                return new OpenBrace(line);
            } else if (symbol == '}') {
                return new CloseBrace(line);
            } else if (symbol == '=') {
                return new Assignment(line);
            } else if (symbol == '+') {
                return new Plus(line);
            } else if (symbol == '-') {
                return new Minus(line);
            } else if (symbol == ';') {
                return new Semicolon(line);
            } else if (symbol == 'true') {
                return new True(line);
            } else if (symbol == 'false') {
                return new False(line);
            } else {
                // TODO: Handle errors better
                return null;
            }
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
})(Combobiler || (Combobiler = {}));
