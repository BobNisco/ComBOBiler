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
                this.analyzeProgram(this.rootNode, this.rootScope, this.astRootNode);
                this.drawTree(this.rootNode, 'cst-tree-graph');
                this.drawTree(this.astRootNode, 'ast-tree-graph');
                this.log({
                    standard: '==== Semantic Analysis end ====',
                    sarcastic: '==== Semantic Analysis end ===='
                });
                console.log(this.astRootNode);
                return this.astRootNode;
            } catch (error) {
                // Clear the tree displays so that the user is not shown improper trees
                this.clearTreeDisplay();
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

        SemanticAnalyzer.prototype.analyzeProgram = function (node, scope, astNode) {
            this.analyzeBlock(node.children[0], scope, astNode);
        };

        SemanticAnalyzer.prototype.analyzeBlock = function (node, scope, astNode) {
            if (this.astRootNode == undefined) {
                this.astRootNode = new Combobiler.TreeNode('Block', null);
                astNode = this.astRootNode;
            } else {
                astNode.addChildNode(new Combobiler.TreeNode('Block', astNode));
                astNode = astNode.getNewestChild();
            }

            for (var i in scope.children) {
                this.analyzeStatementList(node.children[1], scope.children[i], astNode);
            }
        };

        SemanticAnalyzer.prototype.analyzeStatementList = function (node, scope, astNode) {
            if (!node) {
                // Epsilon production
                return;
            }
            if (node.children.length > 0) {
                this.analyzeStatement(node.children[0], scope, astNode);
                this.analyzeStatementList(node.children[1], scope, astNode);
            }
        };

        SemanticAnalyzer.prototype.analyzeStatement = function (node, scope, astNode) {
            if (node.value === 'PrintStatement') {
                this.analyzePrintStatement(node, scope, astNode);
            } else if (node.value === 'AssignmentStatement') {
                this.analyzeAssignmentStatement(node, scope, astNode);
            } else if (node.value === 'VarDecl') {
                this.analyzeVarDecl(node, scope, astNode);
            } else if (node.value === 'WhileStatement') {
                this.analyzeWhileStatement(node, scope, astNode);
            } else if (node.value === 'IfStatement') {
                this.analyzeIfStatement(node, scope, astNode);
            } else if (node.value === 'Block') {
                this.analyzeBlock(node, scope, astNode);
            } else {
                // TODO: Handle error
            }
        };

        SemanticAnalyzer.prototype.analyzeWhileStatement = function (node, scope, astNode) {
            // Add this node to the AST
            astNode.addChildNode(new Combobiler.TreeNode('WhileStatement', astNode));
            astNode = astNode.getNewestChild();

            this.analyzeBooleanExpression(node.children[1], scope, astNode);
            this.analyzeBlock(node.children[2], scope, astNode);
        };

        SemanticAnalyzer.prototype.analyzeAssignmentStatement = function (node, scope, astNode) {
            var currentId = node.children[0].value.value;
            var scopeNode = Combobiler.Scope.findSymbolInScope(currentId, scope);

            astNode.addChildNode(new Combobiler.TreeNode('AssignmentStatement', astNode));
            astNode = astNode.getNewestChild();

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

            // Add the type and the value to the AST
            astNode.addChildNode(new Combobiler.TreeNode(scopeNode.type, astNode));
            astNode.addChildNode(new Combobiler.TreeNode(scopeNode.value, astNode));

            this.log({
                standard: 'VarId ' + currentId + ' was assigned a value with expected type ' + scopeNode.type,
                sarcastic: 'VarId ' + currentId + ' was assigned a value with expected type ' + scopeNode.type
            });
        };

        SemanticAnalyzer.prototype.analyzeVarDecl = function (node, scope, astNode) {
            astNode.addChildNode(new Combobiler.TreeNode('VarDecl', astNode));
            astNode = astNode.getNewestChild();

            astNode.addChildNode(new Combobiler.TreeNode(node.children[0].value, astNode));
            astNode.addChildNode(new Combobiler.TreeNode(node.children[2].value, astNode));
        };

        SemanticAnalyzer.prototype.analyzeIfStatement = function (node, scope, astNode) {
        };

        SemanticAnalyzer.prototype.analyzePrintStatement = function (node, scope, astNode) {
        };

        SemanticAnalyzer.prototype.analyzeBooleanExpression = function (node, scope, astNode) {
        };

        SemanticAnalyzer.prototype.drawTree = function (node, id) {
            var img = go(node.toSynTree(), 13, '', '', 30, 10, true, true);
            $('#' + id).empty();
            $('#' + id).append(img);
        };

        SemanticAnalyzer.prototype.clearTreeDisplay = function () {
            $('.tree-graph').empty();
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
