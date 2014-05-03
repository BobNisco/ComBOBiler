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
            this.staticTable = new Combobiler.StaticTable();
            this.jumpTable = new Combobiler.JumpTable();
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
            var value;
            if (typeof node.value === 'object') {
                value = node.value.value;
            } else {
                value = node.value;
            }
            if (value === 'Block') {
                this.generateBlock(node);
            } else if (value === 'WhileStatement') {
                this.generateWhileStatement(node);
            } else if (value === 'PrintStatement') {
                this.generatePrintStatement(node);
            } else if (value === 'VarDecl') {
                this.generateVarDecl(node);
            } else if (value === 'AssignmentStatement') {
                this.generateAssignmentStatement(node);
            } else if (value === 'IfStatement') {
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
            for (var child in node.children) {
                this.generateCodeForNode(node.children[child]);
            }
            this.log({
                standard: 'Generated code for block',
                sarcastic: 'Generated code for block'
            });
        };

        CodeGenerator.prototype.generatePrintStatement = function (node) {
            var type = node.children[0];
            if (type.value.value === 'StringExpression') {
                // 1. Put the String into the Heap
                var position = this.codeTable.addString(type.children[0].value);

                // 2. Load the accumulator with the address
                this.ldaConst(position.toString(16));

                // 3. Set up registers to prepare for a system call
                this.sta('FF', '00');
                this.ldxConst('02');
                this.ldyMem('FF', '00');
                this.sys();
            } else if (type.value.value === 'IntExpression') {
            } else if (type.value.value === 'BooleanExpression') {
            } else if (type.value.value === 'Id') {
            } else {
                throw new Error('Expected an expression in the Print Statement but got ' + type.value.value + ' instead');
            }

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

        CodeGenerator.prototype.ldaConst = function (byte1) {
            this.codeTable.addCode('A9');
            this.codeTable.addCode(byte1);
        };

        CodeGenerator.prototype.ldaMem = function (byte1, byte2) {
            this.codeTable.addCode('AD');
            this.codeTable.addCode(byte1);
            this.codeTable.addCode(byte2);
        };

        CodeGenerator.prototype.sta = function (byte1, byte2) {
            this.codeTable.addCode('8D');
            this.codeTable.addCode(byte1);
            this.codeTable.addCode(byte2);
        };

        CodeGenerator.prototype.adc = function (byte1, byte2) {
            this.codeTable.addCode('6D');
            this.codeTable.addCode(byte1);
            this.codeTable.addCode(byte2);
        };

        CodeGenerator.prototype.ldxConst = function (byte1) {
            this.codeTable.addCode('A2');
            this.codeTable.addCode(byte1);
        };

        CodeGenerator.prototype.ldxMem = function (byte1, byte2) {
            this.codeTable.addCode('01');
            this.codeTable.addCode(byte1);
            this.codeTable.addCode(byte2);
        };

        CodeGenerator.prototype.ldyConst = function (byte1) {
            this.codeTable.addCode('A0');
            this.codeTable.addCode(byte1);
        };

        CodeGenerator.prototype.ldyMem = function (byte1, byte2) {
            this.codeTable.addCode('AC');
            this.codeTable.addCode(byte1);
            this.codeTable.addCode(byte2);
        };

        CodeGenerator.prototype.nop = function () {
            this.codeTable.addCode('EA');
        };

        CodeGenerator.prototype.break = function () {
            this.codeTable.addCode('00');
        };

        CodeGenerator.prototype.cpx = function (byte1, byte2) {
            this.codeTable.addCode('EC');
            this.codeTable.addCode(byte1);
            this.codeTable.addCode(byte2);
        };

        CodeGenerator.prototype.bne = function (byte1) {
            this.codeTable.addCode('F0');
            this.codeTable.addCode(byte1);
        };

        CodeGenerator.prototype.inc = function (byte1, byte2) {
            this.codeTable.addCode('EE');
            this.codeTable.addCode(byte1);
            this.codeTable.addCode(byte2);
        };

        CodeGenerator.prototype.sys = function () {
            this.codeTable.addCode('FF');
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
        CodeGenerator.operations = {
            'lda-const': 'A9',
            'lda-mem': 'AD',
            'sta': '8D',
            'adc': '6D',
            'ldx-const': 'A2',
            'ldx-mem': 'AE',
            'ldy-const': 'A0',
            'ldy-mem': 'AC',
            'nop': 'EA',
            'brk': '00',
            'cpx': 'EC',
            'bne': 'D0',
            'inc': 'EE',
            'sys': 'FF'
        };
        return CodeGenerator;
    })();
    Combobiler.CodeGenerator = CodeGenerator;
})(Combobiler || (Combobiler = {}));
