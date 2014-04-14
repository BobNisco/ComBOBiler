///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
var Combobiler;
(function (Combobiler) {
    var SemanticAnalyzer = (function () {
        function SemanticAnalyzer(rootNode, currentScope) {
            this.rootNode = rootNode;
            this.currentScope = currentScope;
            // Define some default logger options for the Semantic Analyzer
            this.loggerOptions = {
                type: 'semantic-analyzer',
                header: 'Semantic Analysis'
            };
            this.currentNode = this.rootNode;
        }
        SemanticAnalyzer.prototype.performSemanticAnalysis = function () {
            this.log({
                standard: '==== Semantic Analysis start ====',
                sarcastic: '==== Semantic Analysis start ===='
            });
            try  {
                console.log(this.rootNode);
                this.analyzeProgram(this.rootNode);
                this.log({
                    standard: '==== Semantic Analysis end ====',
                    sarcastic: '==== Semantic Analysis end ===='
                });
            } catch (error) {
                this.error({
                    standard: error,
                    sarcastic: error
                });

                this.error({
                    standard: '==== Semantic Analysis ended due to error ====',
                    sarcastic: '==== Semantic Analysis ended due to error ===='
                });
            }
        };

        SemanticAnalyzer.prototype.analyzeProgram = function (node) {
            this.analyzeBlock(node.children[0]);
        };

        SemanticAnalyzer.prototype.analyzeBlock = function (node) {
            // TODO: Create new scope
        };

        SemanticAnalyzer.prototype.analyzeWhileStatement = function (node) {
            this.analyzeBooleanExpression(node.children[0]);
            this.analyzeBlock(node.children[1]);
        };

        SemanticAnalyzer.prototype.analyzePrintStatement = function (node) {
        };

        SemanticAnalyzer.prototype.analyzeBooleanExpression = function (node) {
        };

        /**
        * Internal handler for passing our log message to the logger. This method should
        * be used for non-errors in the parser.
        *
        * @param message the text to be put into the output field
        */
        SemanticAnalyzer.prototype.log = function (messages) {
            LOGGER.log($.extend({ displayClass: 'label-info' }, this.loggerOptions), messages);
        };

        /**
        * Internal handler for passsing our error message to the logger. This method
        * should be used for errors in the parser.
        *
        * @param message the text to be put into the output field
        */
        SemanticAnalyzer.prototype.error = function (messages) {
            LOGGER.log($.extend({ displayClass: 'label-danger' }, this.loggerOptions), messages);
        };
        return SemanticAnalyzer;
    })();
    Combobiler.SemanticAnalyzer = SemanticAnalyzer;
})(Combobiler || (Combobiler = {}));
