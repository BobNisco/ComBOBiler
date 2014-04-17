/// <reference path="../vendor/tsUnit.ts" />
/// <reference path="../runner.ts" />
/// <reference path="../parser.ts" />
/// <reference path="../lexer.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Combobiler;
(function (Combobiler) {
    var CompilerTests = (function (_super) {
        __extends(CompilerTests, _super);
        function CompilerTests() {
            _super.apply(this, arguments);
            this.target = new Combobiler.Lexer('');
        }
        CompilerTests.prototype.printHelloWorldLex = function () {
            this.target = new Combobiler.Lexer('{ print("hello world") } $', true);

            var result = this.target.performLexicalAnalysis();

            var expected = [
                Combobiler.Token.makeNewToken("{", 1),
                Combobiler.Token.makeNewToken("print", 1),
                Combobiler.Token.makeNewToken('(', 1),
                Combobiler.Token.makeNewToken("\"hello world\"", 1),
                Combobiler.Token.makeNewToken(")", 1),
                Combobiler.Token.makeNewToken("}", 1),
                Combobiler.Token.makeNewToken("$", 1)
            ];

            for (var i in result) {
                if (result[i] instanceof Combobiler.ValueToken) {
                    this.areIdentical(result[i].value, expected[i].value);
                } else {
                    this.areIdentical(result[i].symbol, expected[i].symbol);
                }
            }
        };
        return CompilerTests;
    })(tsUnit.TestClass);
    Combobiler.CompilerTests = CompilerTests;
})(Combobiler || (Combobiler = {}));

// new instance of tsUnit
var test = new tsUnit.Test();

// add your test class (you can call this multiple times)
test.addTestClass(new Combobiler.CompilerTests());

// Use the built in results display
test.showResults(document.getElementById('results'), test.run());
