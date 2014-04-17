///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
var Combobiler;
(function (Combobiler) {
    var TreeNode = (function () {
        function TreeNode(value, parent) {
            this.value = value;
            this.parent = parent;
            this.children = new Array();
        }
        TreeNode.prototype.addChildNode = function (value) {
            var temp = new TreeNode(value, this);
            this.children.push(temp);
        };

        TreeNode.prototype.getNewestChild = function () {
            return this.children[this.children.length - 1];
        };

        TreeNode.prototype.printTree = function () {
            console.log(this);
            for (var i in this.children) {
                this.children[i].printTree();
            }
        };

        TreeNode.prototype.serializeTree = function () {
            var result = this.serializeNode();
            for (var i in this.children) {
                result += this.children[i].serializeTree();
            }
            return result;
        };

        TreeNode.prototype.serializeNode = function () {
            if (this.value instanceof Combobiler.ValueToken) {
                return this.value.value;
            } else if (this.value instanceof Combobiler.Token) {
                return this.value.symbol;
            }
            return this.value;
        };

        /**
        * A recursive function will return the tree starting from this
        * into notation expected by SynTree.js
        */
        TreeNode.prototype.toSynTree = function () {
            var result = '[';

            // This monstrosity properly prints out any of the possible
            // values that could be on the CST/AST.
            // TODO: Drink a Red Bull and refactor at some point
            if (this.value instanceof TreeNode) {
                if (this.value.value instanceof Combobiler.ValueToken) {
                    // Enough values?
                    // TODO: Get more creative with my naming conventions
                    result += this.value.value.value;
                } else if (this.value.value instanceof Combobiler.Token) {
                    result += this.value.value.symbol;
                } else {
                    result += this.value.value;
                }
            } else {
                result += this.value;
            }
            result += ' ';
            for (var i in this.children) {
                result += this.children[i].toSynTree() + ' ';
            }
            result += ']';
            return result;
        };

        TreeNode.prototype.evaluateNode = function () {
            if (this.value === 'PrintStatement') {
                return [this.children[2].evaluateNode()];
            } else if (this.value === 'AssignmentStatement') {
                return [this.children[0].evaluateNode(), this.children[2].evaluateNode()];
            } else if (this.value === 'VarDecl') {
                return [this.children[0].evaluateNode(), this.children[1].evaluateNode()];
            } else if (this.value === 'WhileStatement') {
                return [this.children[1].evaluateNode(), this.children[2].evaluateNode()];
            } else if (this.value === 'IfStatement') {
                return [this.children[1].evaluateNode(), this.children[2].evaluateNode()];
            } else if (this.value === 'Block') {
                return [this.children[1].evaluateNode()];
            } else if (this.value === 'Expression') {
                return [this.children[0].evaluateNode()];
            } else if (this.value === 'StringExpression') {
                return [this.children[0].value.value];
            } else if (this.value === 'IntExpression') {
                // Handle 2 cases for int exprs
                if (this.children.length == 1) {
                    // The + unary operator is the equivalent of parseInt/parseFloat in JS
                    return [+this.children[0].value.value];
                } else if (this.children.length == 3) {
                    var result = this.children[0].value.value + this.children[2].evaluateNode();
                    console.log(result);
                    return [result];
                } else {
                    throw new Error('Malformed Integer Expression');
                }
            }
        };
        return TreeNode;
    })();
    Combobiler.TreeNode = TreeNode;
})(Combobiler || (Combobiler = {}));
