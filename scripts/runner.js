///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
///<reference path="logger.ts" />
///<reference path="lexer.ts" />
var Combobiler;
(function (Combobiler) {
    var Runner = (function () {
        function Runner() {
        }
        Runner.run = function (source) {
            try  {
                var lexer = new Combobiler.Lexer(source);
                var tokens = lexer.performLexicalAnalysis();
                if (tokens.length > 0) {
                    // Only move onto parse if we returned tokens
                    var parser = new Combobiler.Parser(tokens);
                    parser.performParse();
                }
            } catch (error) {
                return false;
            }
            return true;
        };
        return Runner;
    })();
    Combobiler.Runner = Runner;
})(Combobiler || (Combobiler = {}));
