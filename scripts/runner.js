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
                    var parseData = parser.performParse();
                    var cstRootNode = parseData.rootNode;
                    var currentScope = parseData.currentScope;

                    if (cstRootNode !== null) {
                        // Only move onto Semantic Analysis if the CST isn't null
                        var semanticAnalyzer = new Combobiler.SemanticAnalyzer(cstRootNode, currentScope);
                        semanticAnalyzer.performSemanticAnalysis();
                    }
                }
            } catch (error) {
                // Clear the tree displays so that the user is not shown improper trees
                Combobiler.SemanticAnalyzer.clearTreeDisplay();
                return false;
            }
            return true;
        };
        return Runner;
    })();
    Combobiler.Runner = Runner;
})(Combobiler || (Combobiler = {}));
