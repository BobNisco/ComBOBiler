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
                this.rootScope = new Combobiler.Scope({}, null);

                this.analyzeProgram(this.rootNode, this.rootScope, this.astRootNode);
                this.drawTree(this.astRootNode, 'ast-tree-graph');
                this.drawTree(this.rootNode, 'cst-tree-graph');
                this.log({
                    standard: '==== Semantic Analysis end ====',
                    sarcastic: '==== Semantic Analysis end ===='
                });
                return this.astRootNode;
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

            // Since a block indicates a new Scope, we'll open a new one up
            scope.addChildScope({});
            scope = scope.getNewestChild();
            this.log({
                standard: 'Opening up a new scope block',
                sarcastic: 'Opening up a new scope block'
            });

            this.analyzeStatementList(node.children[1], scope, astNode);

            // Before this function breaks out of recursion,
            // we'll check for some unused identifiers
            if (scope.hasUnusedIdentifiers()) {
                var list = scope.unusedIdentifierList();
                for (var i in list) {
                    this.warning({
                        standard: 'Check yo self! You never used variable with identifier ' + i,
                        sarcastic: 'Quit wasting my space with your unused identifier ' + i
                    });
                }
            }

            // Also, we'll log some info about what was in this scope block
            if (Object.keys(scope.getSymbols()).length > 0) {
                this.log({
                    standard: 'The scope block being closed held the following info ' + scope.toString(),
                    sarcastic: 'The scope block being closed held the following info ' + scope.toString()
                });
            } else {
                this.log({
                    standard: 'Closing a scope block that held no symbols',
                    sarcastic: 'Closing a scope block that held no symbols'
                });
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
            this.assignValue(node, scope, astNode, currentId);
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
            } else if (scopeNode.type === 'boolean') {
                // Create a test variable that we know is of type boolean
                var booleanTestType = true;

                // Assert that the type is a boolean, since this is a statically typed language
                this.assertType(scopeNode.value, booleanTestType);
            } else {
                throw new Error('Unknown type in Assignment Statement');
            }

            // Add the type and the value to the AST
            astNode.addChildNode(new Combobiler.TreeNode(currentId, astNode));
            this.analyzeExpression(node.children[2], scope, astNode);

            this.log({
                standard: 'VarId ' + currentId + ' was assigned a value with expected type ' + scopeNode.type,
                sarcastic: 'VarId ' + currentId + ' was assigned a value with expected type ' + scopeNode.type
            });
        };

        SemanticAnalyzer.prototype.assignValue = function (node, scope, astNode, currentId) {
            var exprType = node.children[2].children[0].value;
            var potentialValue = node.children[2].children[0].children[0].value.value;
            if (exprType === 'IntExpression') {
                scope.assignValue(currentId, parseInt(potentialValue));
            } else if (exprType === 'BooleanExpression') {
                scope.assignValue(currentId, !!potentialValue);
            } else if (exprType === 'StringExpression') {
                scope.assignValue(currentId, potentialValue);
            } else {
                throw new Error('Unknown value type');
            }
        };

        SemanticAnalyzer.prototype.analyzeVarDecl = function (node, scope, astNode) {
            astNode.addChildNode(new Combobiler.TreeNode('VarDecl', astNode));
            astNode = astNode.getNewestChild();

            // Add this to the current scope
            scope.addSymbol(node.children[2].value.value, new Combobiler.ScopeNode(null, node.children[0].value.symbol));

            astNode.addChildNode(new Combobiler.TreeNode(node.children[0].value, astNode));
            astNode.addChildNode(new Combobiler.TreeNode(node.children[2].value, astNode));
        };

        SemanticAnalyzer.prototype.analyzeIfStatement = function (node, scope, astNode) {
            astNode.addChildNode(new Combobiler.TreeNode(node.value, astNode));
            astNode = astNode.getNewestChild();

            this.analyzeBooleanExpression(node.children[1], scope, astNode);
            this.analyzeBlock(node.children[2], scope, astNode);
        };

        SemanticAnalyzer.prototype.analyzePrintStatement = function (node, scope, astNode) {
            astNode.addChildNode(new Combobiler.TreeNode('PrintStatement', astNode));
            astNode = astNode.getNewestChild();

            this.analyzeExpression(node.children[2], scope, astNode);
        };

        SemanticAnalyzer.prototype.analyzeExpression = function (node, scope, astNode) {
            if (node.children[0].value === 'IntExpression') {
                this.analyzeIntExpression(node.children[0], scope, astNode);
            } else if (node.children[0].value === 'StringExpression') {
                this.analyzeStringExpression(node.children[0], scope, astNode);
            } else if (node.children[0].value === 'BooleanExpression') {
                this.analyzeBooleanExpression(node.children[0], scope, astNode);
            } else if (node.children[0].value === 'Id') {
                this.analyzeId(node.children[0], scope, astNode);
            }
        };

        SemanticAnalyzer.prototype.analyzeId = function (node, scope, astNode) {
            // Ensure that the id exists at least
            Combobiler.Scope.findSymbolInScope(node.children[0].value.value, scope);

            astNode.addChildNode(new Combobiler.TreeNode(node.children[0].value.value, astNode));
        };

        SemanticAnalyzer.prototype.analyzeStringExpression = function (node, scope, astNode) {
            astNode.addChildNode(new Combobiler.TreeNode(node.children[0].value, astNode));
        };

        SemanticAnalyzer.prototype.analyzeIntExpression = function (node, scope, astNode) {
            astNode.addChildNode(new Combobiler.TreeNode(node.children[0].value.value, astNode));
            if (node.children.length === 3) {
                astNode.addChildNode(new Combobiler.TreeNode('+', astNode));
                this.analyzeExpression(node.children[2], scope, astNode);
            }
        };

        SemanticAnalyzer.prototype.analyzeBooleanExpression = function (node, scope, astNode) {
            if (node.children.length === 1) {
                astNode.addChildNode(new Combobiler.TreeNode(node.children[0].value, astNode));
            } else if (node.children.length === 5) {
                this.analyzeExpression(node.children[1], scope, astNode);
                astNode.addChildNode(new Combobiler.TreeNode(node.children[2].value, astNode));
                this.analyzeExpression(node.children[3], scope, astNode);
            } else {
                throw new Error('Malformed BooleanExpression');
            }
        };

        SemanticAnalyzer.prototype.drawTree = function (node, id) {
            try  {
                var img = go(node.toSynTree(), 13, '', '', 40, 10, true, true);
                $('#' + id).empty();
                $('#' + id).append(img);
            } catch (error) {
                // Just let the error go
                // Looks like the library has a problem when trying to draw a tree
                // from the source code example: {}$
            }
        };

        SemanticAnalyzer.clearTreeDisplay = function () {
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

        SemanticAnalyzer.prototype.warning = function (messages) {
            LOGGER.log($.extend({ displayClass: 'label-warning' }, this.loggerOptions), messages);
        };
        return SemanticAnalyzer;
    })();
    Combobiler.SemanticAnalyzer = SemanticAnalyzer;
})(Combobiler || (Combobiler = {}));
