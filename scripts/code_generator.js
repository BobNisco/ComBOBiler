///<reference path="token.ts" />
///<reference path="tree_node.ts" />
///<reference path="scope.ts" />
var Combobiler;
(function (Combobiler) {
    var CodeGenerator = (function () {
        function CodeGenerator(astRootNode) {
            this.astRootNode = astRootNode;
            // Define some default logger options for the Code Generator
            this.loggerOptions = {
                type: 'code-generator',
                header: 'Code Generator'
            };
            this.codeTable = new Combobiler.CodeTable();
        }
        CodeGenerator.prototype.performCodeGeneration = function () {
            try  {
                this.log({
                    standard: '==== Code Generator start ====',
                    sarcastic: '==== Code Generator start ===='
                });
                if (this.astRootNode === null) {
                    throw new Error('Null AST passed into code generator, can not start code generation');
                }
                this.generateCodeForNode(this.astRootNode);
                this.codeTable.finalizeCodeTable();
                this.log({
                    standard: '==== Code Generator end ====',
                    sarcastic: '==== Code Generator end ===='
                });
                return this.codeTable.createStringForDisplay();
            } catch (error) {
                this.error({
                    standard: error,
                    sarcastic: error
                });

                this.error({
                    standard: '==== Code Generator ended due to error ====',
                    sarcastic: '==== Code Generator ended due to error ===='
                });
                return;
            }
        };

        CodeGenerator.prototype.generateCodeForNode = function (node) {
            if (node.value === 'Block') {
                this.generateBlock(node);
            } else if (node.value === 'WhileStatement') {
                this.generateWhileStatement(node);
            } else if (node.value === 'PrintStatement') {
                this.generatePrintStatement(node);
            } else if (node.value === 'VarDecl') {
                this.generateVarDecl(node);
            } else if (node.value === 'AssignmentStatement') {
                this.generateAssignmentStatement(node);
            } else if (node.value === 'IfStatement') {
                this.generateIfStatement(node);
            }
        };

        CodeGenerator.prototype.generateWhileStatement = function (node) {
            this.log({
                standard: 'Generated code for While Statement',
                sarcastic: 'Generated code for While Statement'
            });
        };

        CodeGenerator.prototype.generateBlock = function (node) {
            this.log({
                standard: 'Generated code for block',
                sarcastic: 'Generated code for block'
            });
        };

        CodeGenerator.prototype.generatePrintStatement = function (node) {
            this.log({
                standard: 'Generated code for print statement',
                sarcastic: 'Generated code for print statement'
            });
        };

        CodeGenerator.prototype.generateVarDecl = function (node) {
            this.log({
                standard: 'Generated code for variable declaration',
                sarcastic: 'Generated code for variable declaration'
            });
        };

        CodeGenerator.prototype.generateAssignmentStatement = function (node) {
            this.log({
                standard: 'Generated code for assignment statement',
                sarcastic: 'Generated code for assignment statement'
            });
        };

        CodeGenerator.prototype.generateIfStatement = function (node) {
            this.log({
                standard: 'Generated code for if statement',
                sarcastic: 'Generated code for if statement'
            });
        };

        /**
        * Internal handler for passing our log message to the logger. This method should
        * be used for non-errors in the parser.
        *
        * @param message the text to be put into the output field
        */
        CodeGenerator.prototype.log = function (messages) {
            LOGGER.log($.extend({ displayClass: 'label-info' }, this.loggerOptions), messages);
        };

        /**
        * Internal handler for passsing our error message to the logger. This method
        * should be used for errors in the parser.
        *
        * @param message the text to be put into the output field
        */
        CodeGenerator.prototype.error = function (messages) {
            LOGGER.log($.extend({ displayClass: 'label-danger' }, this.loggerOptions), messages);
        };

        CodeGenerator.prototype.warning = function (messages) {
            LOGGER.log($.extend({ displayClass: 'label-warning' }, this.loggerOptions), messages);
        };
        return CodeGenerator;
    })();
    Combobiler.CodeGenerator = CodeGenerator;
})(Combobiler || (Combobiler = {}));
