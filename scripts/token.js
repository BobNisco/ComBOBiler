var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Combobiler;
(function (Combobiler) {
    var Token = (function () {
        function Token(s) {
            this.symbol = s;
        }
        return Token;
    })();
    Combobiler.Token = Token;

    var While = (function (_super) {
        __extends(While, _super);
        function While() {
            _super.call(this, 'while');
        }
        return While;
    })(Token);
    Combobiler.While = While;

    var LParen = (function (_super) {
        __extends(LParen, _super);
        function LParen() {
            _super.call(this, '(');
        }
        return LParen;
    })(Token);
    Combobiler.LParen = LParen;

    var RParen = (function (_super) {
        __extends(RParen, _super);
        function RParen() {
            _super.call(this, ')');
        }
        return RParen;
    })(Token);
    Combobiler.RParen = RParen;

    var LessThan = (function (_super) {
        __extends(LessThan, _super);
        function LessThan() {
            _super.call(this, '<');
        }
        return LessThan;
    })(Token);
    Combobiler.LessThan = LessThan;

    var GreaterThan = (function (_super) {
        __extends(GreaterThan, _super);
        function GreaterThan() {
            _super.call(this, '>');
        }
        return GreaterThan;
    })(Token);
    Combobiler.GreaterThan = GreaterThan;

    var OpenBrace = (function (_super) {
        __extends(OpenBrace, _super);
        function OpenBrace() {
            _super.call(this, '{');
        }
        return OpenBrace;
    })(Token);
    Combobiler.OpenBrace = OpenBrace;

    var CloseBrace = (function (_super) {
        __extends(CloseBrace, _super);
        function CloseBrace() {
            _super.call(this, '}');
        }
        return CloseBrace;
    })(Token);
    Combobiler.CloseBrace = CloseBrace;

    var Assignment = (function (_super) {
        __extends(Assignment, _super);
        function Assignment() {
            _super.call(this, '=');
        }
        return Assignment;
    })(Token);
    Combobiler.Assignment = Assignment;

    var Plus = (function (_super) {
        __extends(Plus, _super);
        function Plus() {
            _super.call(this, '+');
        }
        return Plus;
    })(Token);
    Combobiler.Plus = Plus;

    var Minus = (function (_super) {
        __extends(Minus, _super);
        function Minus() {
            _super.call(this, '-');
        }
        return Minus;
    })(Token);
    Combobiler.Minus = Minus;

    var Multiply = (function (_super) {
        __extends(Multiply, _super);
        function Multiply() {
            _super.call(this, '*');
        }
        return Multiply;
    })(Token);
    Combobiler.Multiply = Multiply;

    var Divide = (function (_super) {
        __extends(Divide, _super);
        function Divide() {
            _super.call(this, '/');
        }
        return Divide;
    })(Token);
    Combobiler.Divide = Divide;

    var Semicolon = (function (_super) {
        __extends(Semicolon, _super);
        function Semicolon() {
            _super.call(this, ';');
        }
        return Semicolon;
    })(Token);
    Combobiler.Semicolon = Semicolon;
})(Combobiler || (Combobiler = {}));
