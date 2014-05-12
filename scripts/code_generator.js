///<reference path="token.ts" />
///<reference path="tree_node.ts" />
///<reference path="scope.ts" />
var Combobiler;
(function (Combobiler) {
    var CodeGenerator = (function () {
        function CodeGenerator(astRootNode, rootScope) {
            this.astRootNode = astRootNode;
            this.rootScope = rootScope;
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
                this.generateCodeForNode(this.astRootNode, this.rootScope);
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

        CodeGenerator.prototype.generateCodeForNode = function (node, scope) {
            var value = this.determineTypeOfNode(node);
            if (value === 'Block') {
                this.generateBlock(node, scope);
            } else if (value === 'WhileStatement') {
                this.generateWhileStatement(node, scope);
            } else if (value === 'PrintStatement') {
                this.generatePrintStatement(node, scope);
            } else if (value === 'VarDecl') {
                this.generateVarDecl(node, scope);
            } else if (value === 'AssignmentStatement') {
                this.generateAssignmentStatement(node, scope);
            } else if (value === 'IfStatement') {
                this.generateIfStatement(node, scope);
            }
        };

        CodeGenerator.prototype.determineTypeOfNode = function (node) {
            var value;
            if (typeof node.value === 'object') {
                value = node.value.value;
            } else {
                value = node.value;
            }
            return value;
        };

        CodeGenerator.prototype.generateWhileStatement = function (node, scope) {
            this.log({
                standard: 'Generated code for While Statement',
                sarcastic: 'Generated code for While Statement'
            });
        };

        CodeGenerator.prototype.generateBlock = function (node, scope) {
            var currentScope = 0;
            for (var child in node.children) {
                if (this.determineTypeOfNode(node.children[child]) === 'Block') {
                    scope = scope.children[currentScope++];
                }
                this.generateCodeForNode(node.children[child], scope);
            }
            this.log({
                standard: 'Generated code for block',
                sarcastic: 'Generated code for block'
            });
        };

        CodeGenerator.prototype.generatePrintStatement = function (node, scope) {
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
                // 1. Find the variable we'll be printing
                var varIdStaticTableEntry = this.staticTable.findByVarIdAndScope(type.children[0].value.value, scope);

                // 2. Load the Y register with contents of the variable
                this.ldyMem(varIdStaticTableEntry.temp, 'XX');

                // 3. Load the X register with 1
                this.ldxConst('01');

                // 4. System call
                this.sys();
            } else {
                throw new Error('Expected an expression in the Print Statement but got ' + type.value.value + ' instead');
            }

            this.log({
                standard: 'Generated code for print statement',
                sarcastic: 'Generated code for print statement'
            });
        };

        CodeGenerator.prototype.generateVarDecl = function (node, scope) {
            var varTypeNode = node.children[0];
            var varIdNode = node.children[1];

            if (varTypeNode.value.value.symbol === 'int') {
                this.generateIntVarDecl(varTypeNode, varIdNode, scope);
            } else if (varTypeNode.value.value.symbol === 'string') {
                this.generateStringVarDecl(varTypeNode, varIdNode, scope);
            } else if (varTypeNode.value.value.symbol === 'bool') {
                this.generateBoolVarDecl(varTypeNode, varIdNode, scope);
            } else {
                throw new Error('Unknown type! How did you let this happen, front-end compiler!?');
            }
        };

        CodeGenerator.prototype.generateIntVarDecl = function (varTypeNode, varIdNode, scope) {
            // 1. Generate code to initialize our integers to 0
            this.ldaConst('00');

            // 2. Make an entry in the static table
            var tempId = this.staticTable.getNextTempId();
            this.staticTable.add(new Combobiler.StaticTableEntry(tempId, varIdNode.value.value.value, 0, scope));

            // 3. Store the temp address in the code table
            this.sta(tempId, 'XX');
            this.log({
                standard: 'Generated code for int variable declaration',
                sarcastic: 'Generated code for int variable declaration'
            });
        };

        CodeGenerator.prototype.generateStringVarDecl = function (varTypeNode, varIdNode, scope) {
            var tempId = this.staticTable.getNextTempId();
            this.staticTable.add(new Combobiler.StaticTableEntry(tempId, varIdNode.value.value.value, 0, scope));
            this.log({
                standard: 'Generated code for string variable declaration',
                sarcastic: 'Generated code for string variable declaration'
            });
        };

        CodeGenerator.prototype.generateBoolVarDecl = function (varTypeNode, varIdNode, scope) {
            this.log({
                standard: 'Generated code for boolean variable declaration',
                sarcastic: 'Generated code for boolean variable declaration'
            });
        };

        CodeGenerator.prototype.generateAssignmentStatement = function (node, scope) {
            var varIdNode = node.children[0];
            var valueNode = node.children[1];

            if (valueNode.value.value === 'IntExpression') {
                this.generateIntAssignmentStatement(varIdNode, valueNode, scope);
            } else if (valueNode.value.value === 'StringExpression') {
                this.generateStringAssignmentStatement(varIdNode, valueNode, scope);
            } else if (valueNode.value.value === 'BooleanExpression') {
                this.generateBooleanAssignmentStatement(varIdNode, valueNode, scope);
            } else if (valueNode.value.value === 'Id') {
                this.generateIdAssignmentStatement(varIdNode, valueNode, scope);
            } else {
                throw new Error('Front-end compiler, ARE YOU EVEN DOING YOUR JOB!?');
            }
        };

        CodeGenerator.prototype.generateIntAssignmentStatement = function (varIdNode, valueNode, scope) {
            // 1. Load the value into our accumulator
            this.ldaConst(this.leftPad(valueNode.children[0].value.value, 2));

            // 2. Store the accumulator into memory at the temp position
            var staticTableEntry = this.staticTable.findByVarIdAndScope(varIdNode.value.value, scope);
            this.sta(staticTableEntry.temp, 'XX');
            this.log({
                standard: 'Generated code for int assignment statement',
                sarcastic: 'Generated code for int assignment statement'
            });
        };

        CodeGenerator.prototype.generateStringAssignmentStatement = function (varIdNode, valueNode, scope) {
            // 1. Put the string into the heap
            var position = this.codeTable.addString(valueNode.children[0].value);

            // 2. Load the accumulator with the address of the string
            this.ldaConst(position.toString(16));

            // 3. Store the accumulator into memory at the temp position
            var staticTableEntry = this.staticTable.findByVarIdAndScope(varIdNode.value.value, scope);
            this.sta(staticTableEntry.temp, 'XX');
            this.log({
                standard: 'Generated code for string assignment statement',
                sarcastic: 'Generated code for string assignment statement'
            });
        };

        CodeGenerator.prototype.generateBooleanAssignmentStatement = function (varIdNode, valueNode, scope) {
            this.log({
                standard: 'Generated code for boolean assignment statement',
                sarcastic: 'Generated code for boolean assignment statement'
            });
        };

        CodeGenerator.prototype.generateIdAssignmentStatement = function (varIdNode, valueNode, scope) {
            // 1. Find the variable we are setting it to in the static table
            var valueStaticTableEntry = this.staticTable.findByVarIdAndScope(valueNode.children[0].value.value, scope);

            // 2. Load the pointer into accumulator
            this.ldaMem(valueStaticTableEntry.temp, 'XX');

            // 3. Find the variable in the static table
            var varIdStaticTableEntry = this.staticTable.findByVarIdAndScope(varIdNode.value.value, scope);

            // 4. Store what's in the accumulator into memory
            this.sta(varIdStaticTableEntry.temp, 'XX');
            this.log({
                standard: 'Generated code for id assignment statement',
                sarcastic: 'Generated code for id assignment statement'
            });
        };

        CodeGenerator.prototype.generateIfStatement = function (node, scope) {
            // 1. The if statement
            var ifStatement = node.children[0];

            // Writing an if statement to check equality of equality statements, so meta
            if (ifStatement.value.value.symbol === "==") {
                this.generateEqual(ifStatement, scope);
            } else if (ifStatement.value.value.symbol === "!=") {
            } else {
                throw new Error('Malformed if statement');
            }
            this.generateBlock(node.children[1], scope);
            this.log({
                standard: 'Generated code for if statement',
                sarcastic: 'Generated code for if statement'
            });
        };

        CodeGenerator.prototype.generateEqual = function (node, scope) {
            this.checkForNestedComparison(node.children[1], scope);
            //this.ldxConst(node.children)
        };

        CodeGenerator.prototype.checkForNestedComparison = function (node, scope) {
            for (var i = 0; i < node.children.length; i++) {
                var value = this.determineTypeOfNode(node.children[i]);
                if (value === "==" || value === "!=") {
                    throw new Error('Sorry, right now ComBOBiler can not generate code for nested if statements. If you would like to purchase him a beverage, he will consider adding in support.');
                }
            }
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

        CodeGenerator.prototype.leftPad = function (data, length) {
            var temp = '' + data;
            while (temp.length < length) {
                temp = '0' + temp;
            }
            return temp;
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
