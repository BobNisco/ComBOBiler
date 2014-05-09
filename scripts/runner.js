///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
///<reference path="logger.ts" />
///<reference path="lexer.ts" />
///<reference path="parser.ts" />
///<reference path="semantic_analyzer.ts" />
var Combobiler;
(function (Combobiler) {
    var Runner = (function () {
        function Runner() {
        }
        Runner.prototype.run = function (source) {
            Runner.run(source);
        };

        Runner.run = function (source) {
            try  {
                // Clear the tree displays so that the user is not shown improper trees
                Combobiler.SemanticAnalyzer.clearTreeDisplay();
                var lexer = new Combobiler.Lexer(source);
                var tokens = lexer.performLexicalAnalysis();

                if (tokens.length > 0) {
                    // Only move onto parse if we returned tokens
                    var parser = new Combobiler.Parser(tokens);
                    var parseData = parser.performParse();
                    var cstRootNode = parseData.rootNode;

                    if (cstRootNode === null) {
                        throw new Error('Parse did not return any nodes, so Semantic Analysis can not start');
                    }

                    var semanticAnalyzer = new Combobiler.SemanticAnalyzer(cstRootNode, null);
                    var semanticAnalyzerResults = semanticAnalyzer.performSemanticAnalysis();
                    if (semanticAnalyzerResults.astRootNode === null) {
                        throw new Error('Semantic Analysis returned a null AST, so Code Gen can not start');
                    }
                    if (semanticAnalyzerResults.rootScope === null) {
                        throw new Error('Semantic Analysis returned no scope data, so Code Gen can not start');
                    }

                    var codeGenerator = new Combobiler.CodeGenerator(semanticAnalyzerResults.astRootNode, semanticAnalyzerResults.rootScope);
                    var generatedCode = codeGenerator.performCodeGeneration();
                    return generatedCode;
                }
            } catch (error) {
                return;
            }
        };
        return Runner;
    })();
    Combobiler.Runner = Runner;
})(Combobiler || (Combobiler = {}));
