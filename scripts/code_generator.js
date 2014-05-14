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
            this.currentBlock = 0;
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

                // Manually put a break in for the end of code just to be safe
                this.break();
                this.codeTable.finalizeCodeTable();
                this.jumpTable.backpatch(this.codeTable);
                this.staticTable.backpatch(this.codeTable);
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
            // 1. Generate the boolean expression
            this.generateBooleanExpression(node.children[0], scope);

            // 2. Handle the block
            this.generateBlock(node.children[1], scope);
            this.log({
                standard: 'Generated code for While Statement',
                sarcastic: 'Generated code for While Statement'
            });
        };

        CodeGenerator.prototype.generateBlock = function (node, scope) {
            this.currentBlock++;
            scope = this.findScopeByCurrentId();
            for (var i = 0; i < node.children.length; i++) {
                this.generateCodeForNode(node.children[i], scope);
            }
            this.currentBlock = scope.parent.id;
            scope = this.findScopeByCurrentId();
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

                // 3. Load the X register with a value based on type of Id
                if (Combobiler.Scope.findSymbolInScope(type.children[0].value.value, scope).type === 'int') {
                    this.ldxConst('01');
                } else {
                    this.ldxConst('02');
                }

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
            this.staticTable.add(new Combobiler.StaticTableEntry(tempId, varIdNode.value.value.value, this.staticTable.getNextOffsetNumber(), scope));

            // 3. Store the temp address in the code table
            this.sta(tempId, 'XX');
            this.log({
                standard: 'Generated code for int variable declaration',
                sarcastic: 'Generated code for int variable declaration'
            });
        };

        CodeGenerator.prototype.generateStringVarDecl = function (varTypeNode, varIdNode, scope) {
            var tempId = this.staticTable.getNextTempId();
            this.staticTable.add(new Combobiler.StaticTableEntry(tempId, varIdNode.value.value.value, this.staticTable.getNextOffsetNumber(), scope));
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
            this.ldaConst(CodeGenerator.leftPad(valueNode.children[0].value.value, 2));

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
            this.ldaConst(CodeGenerator.leftPad(position.toString(16), 2));

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
            // 1. Set up a jump entry
            var jumpTempId = this.jumpTable.getNextTempId();
            var jumpEntry = this.jumpTable.add(new Combobiler.JumpTableEntry(jumpTempId, 0));

            // 2. The boolean expression of the if statement
            this.generateBooleanExpression(node.children[0], scope);
            var startOfJump = this.codeTable.currentPosition;

            // 3. Put in the jump statement
            this.bne(jumpEntry.temp);

            // 4. Generate code for the block
            this.generateBlock(node.children[1], scope);

            // 5. Calculate the jump distance
            //    Subtract one due to the way jumps are handled
            jumpEntry.distance = this.codeTable.currentPosition - startOfJump - 1;
            this.log({
                standard: 'Generated code for if statement',
                sarcastic: 'Generated code for if statement'
            });
        };

        CodeGenerator.prototype.generateBooleanExpression = function (node, scope) {
            // Writing an if statement to check equality of equality statements, so meta
            if (node.value.value.symbol === "==") {
                this.generateEqual(node, scope);
            } else if (node.value.value.symbol === "!=") {
            } else if (node.value.value.symbol === "true") {
            } else if (node.value.value.symbol === "false") {
            } else {
                throw new Error('Malformed if statement');
            }
        };

        CodeGenerator.prototype.getNextSiblingScope = function (scope) {
            for (var i = 0; i < scope.parent.children.length; i++) {
                if (scope.parent.children[i] === scope) {
                    if (scope.parent.children[i + 1] != null) {
                        return scope.parent.children[i + 1];
                    }
                }
            }
            return null;
        };

        CodeGenerator.prototype.generateEqual = function (node, scope) {
            // 0. We're not handling nested comparison right now
            this.checkForNestedComparison(node.children[1], scope);

            // 1. Determine left side values
            var leftSideValue = this.determineTypeOfNode(node.children[0]);
            if (leftSideValue === 'Id') {
                var idStaticTableEntry = this.staticTable.findByVarIdAndScope(node.children[0].children[0].value.value, scope);
                this.ldxMem(idStaticTableEntry.temp, 'XX');
            } else if (leftSideValue === 'IntExpression') {
                this.ldxConst(CodeGenerator.leftPad(node.children[0].children[0].value.value, 2));
            } else if (leftSideValue === 'BooleanExpression') {
                if (node.children[0].value.value === 'true') {
                    this.ldxConst('01');
                } else {
                    this.ldxConst('00');
                }
            } else if (leftSideValue === 'StringExpression') {
                // TODO: Figure out WTF to do here
            }

            // 2. Determine right side values
            var rightSideValue = this.determineTypeOfNode(node.children[1]);
            if (rightSideValue === 'Id') {
                var idStaticTableEntry = this.staticTable.findByVarIdAndScope(node.children[1].children[0].value.value, scope);
                this.cpx(idStaticTableEntry.temp, 'XX');
            } else if (rightSideValue === 'IntExpression') {
                this.ldxConst(CodeGenerator.leftPad(node.children[1].children[0].value.value.toString(16), 2));

                // TODO: Fix this. How do we handle various types of comparisons?
                var idStaticTableEntry = this.staticTable.findByVarIdAndScope(node.children[0].children[0].value.value, scope);
                this.cpx(idStaticTableEntry.temp, 'XX');
            } else if (rightSideValue === 'BooleanExpression') {
                if (node.children[0].value.value === 'true') {
                } else {
                }
            } else if (rightSideValue === 'StringExpression') {
                // TODO: Figure out WTF to do here
            }
        };

        CodeGenerator.prototype.checkForNestedComparison = function (node, scope) {
            for (var i = 0; i < node.children.length; i++) {
                var value = this.determineTypeOfNode(node.children[i]);
                if (value === "==" || value === "!=") {
                    throw new Error('Sorry, right now ComBOBiler can not generate code for nested if statements. If you would like to purchase him a beverage, he will consider adding in support.');
                }
            }
        };

        CodeGenerator.prototype.findScopeByCurrentId = function () {
            return this.findScopeByIdHandler(this.rootScope);
        };

        CodeGenerator.prototype.findScopeByIdHandler = function (scope) {
            if (scope.id === this.currentBlock) {
                return scope;
            }
            for (var i = 0; i < scope.children.length; i++) {
                return this.findScopeByIdHandler(scope.children[i]);
            }
            return null;
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
            this.codeTable.addCode('AE');
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
            this.codeTable.addCode('D0');
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
            CodeGenerator.leftPad(data, length);
        };

        CodeGenerator.leftPad = function (data, length) {
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
        return CodeGenerator;
    })();
    Combobiler.CodeGenerator = CodeGenerator;
})(Combobiler || (Combobiler = {}));
