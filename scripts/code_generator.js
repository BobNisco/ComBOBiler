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
            // Set the expected size of the code table. This should match up with the
            // program size on the OS. Since MS-BOS has a default program size of 256,
            // we will match that for our compiler.
            this.CODE_TABLE_SIZE = 256;
            this.codeTable = new Array(this.CODE_TABLE_SIZE);
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
                this.finalizeCodeTable();
                this.log({
                    standard: '==== Code Generator end ====',
                    sarcastic: '==== Code Generator end ===='
                });
                return this.createCodeTableStringForDisplay();
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
        * Finalizes the code table by putting 0x00 into each spot that isn't occupied.
        * Should be run after back-patching is completed
        */
        CodeGenerator.prototype.finalizeCodeTable = function () {
            for (var i = 0; i < this.CODE_TABLE_SIZE; i++) {
                if (this.codeTable[i] === null || this.codeTable[i] === undefined) {
                    this.codeTable[i] = "00";
                }
            }
        };

        /**
        * Generates a nicely formatted string version of the code table (8 x 32)
        *
        * @return string version of the code table
        */
        CodeGenerator.prototype.createCodeTableStringForDisplay = function () {
            var returnString = '';
            for (var i = 0; i < this.CODE_TABLE_SIZE; i++) {
                if (i % 8 === 0 && i !== 0) {
                    returnString += '\n';
                }
                returnString += this.codeTable[i] + ' ';
            }
            return returnString;
        };

        /**
        * Internal handler for adding code to the table.
        * Performs special checking to ensure code that is added is valid
        *
        * @param data the data (hex) to be added to the code table
        * @param position the position (base-10, 0-indexed) in the codeTable to add the data to
        */
        CodeGenerator.prototype.addToCodeTable = function (data, position) {
            // Uppercase all the letters so that it's uniform regardless
            data.toUpperCase();

            if (!data.match(/^[0-9A-G]{2}/)) {
                throw new Error('Tried to place the data string ' + data + ' in code table, but it is not 2 valid hex characters');
            }
            if (position >= this.CODE_TABLE_SIZE || position < 0) {
                throw new Error('Position ' + position + ' is invalid for our code table');
            }
            this.codeTable[position] = data;
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
