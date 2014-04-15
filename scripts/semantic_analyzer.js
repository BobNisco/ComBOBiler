///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
var Combobiler;
(function (Combobiler) {
    var SemanticAnalyzer = (function () {
        function SemanticAnalyzer(rootNode, rootScope) {
            this.rootNode = rootNode;
            this.rootScope = rootScope;
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
                this.analyzeProgram(this.rootNode, this.rootScope);
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

        SemanticAnalyzer.prototype.analyzeProgram = function (node, scope) {
            this.analyzeBlock(node.children[0], scope);
        };

        SemanticAnalyzer.prototype.analyzeBlock = function (node, scope) {
            for (var i in scope.children) {
                this.analyzeStatementList(node.children[1], scope.children[i]);
            }
        };

        SemanticAnalyzer.prototype.analyzeStatementList = function (node, scope) {
            if (!node) {
                // Epsilon production
                return;
            }
            if (node.children.length > 0) {
                this.analyzeStatement(node.children[0], scope);
                this.analyzeStatementList(node.children[1], scope);
            }
        };

        SemanticAnalyzer.prototype.analyzeStatement = function (node, scope) {
            if (node.value === 'PrintStatement') {
                this.analyzePrintStatement(node, scope);
            } else if (node.value === 'AssignmentStatement') {
                this.analyzeAssignmentStatement(node, scope);
            } else if (node.value === 'VarDecl') {
                this.analyzeVarDecl(node, scope);
            } else if (node.value === 'WhileStatement') {
                this.analyzeWhileStatement(node, scope);
            } else if (node.value === 'IfStatement') {
                this.analyzeIfStatement(node, scope);
            } else if (node.value === 'Block') {
                this.analyzeBlock(node, scope);
            } else {
                // TODO: Handle error
            }
        };

        SemanticAnalyzer.prototype.analyzeWhileStatement = function (node, scope) {
            this.analyzeBooleanExpression(node.children[1], scope);
            this.analyzeBlock(node.children[2], scope);
        };

        SemanticAnalyzer.prototype.analyzeAssignmentStatement = function (node, scope) {
            var currentId = node.children[0].value.value;
            var scopeNode = Combobiler.Scope.findSymbolInScope(currentId, scope);

            if (scopeNode.type === 'int') {
                // Create a test variable that we know is of type number
                var numberTestType = 1;

                // Assert that the type is a number, since this is a statically typed language
                this.assertType(scopeNode.value, numberTestType);
            } else if (scopeNode.type === 'string') {
                // Create a test variable that we know is of type String
                var stringTestType = 'test';

                // Assert that the type is a string, since this is a statically typed language
                this.assertType(scopeNode.value, stringTestType);
            } else if (scopeNode.type === 'bool') {
                // Create a test variable that we know is of type boolean
                var booleanTestType = true;

                // Assert that the type is a boolean, since this is a statically typed language
                this.assertType(scopeNode.value, booleanTestType);
            } else {
                this.error({
                    standard: 'Unknown type!',
                    sarcastic: 'Unknown type!'
                });
            }

            this.log({
                standard: 'VarId ' + currentId + ' was assigned a value with expected type ' + scopeNode.type,
                sarcastic: 'VarId ' + currentId + ' was assigned a value with expected type ' + scopeNode.type
            });
        };

        SemanticAnalyzer.prototype.analyzeVarDecl = function (node, scope) {
        };

        SemanticAnalyzer.prototype.analyzeIfStatement = function (node, scope) {
        };

        SemanticAnalyzer.prototype.analyzePrintStatement = function (node, scope) {
        };

        SemanticAnalyzer.prototype.analyzeBooleanExpression = function (node, scope) {
        };

        SemanticAnalyzer.prototype.assertType = function (val, type) {
            if (typeof val == typeof type) {
                return true;
            } else {
                throw new Error('Expected ' + typeof type + ' but got ' + typeof val + ' instead');
            }
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
