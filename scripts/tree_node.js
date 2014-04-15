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
        return TreeNode;
    })();
    Combobiler.TreeNode = TreeNode;
})(Combobiler || (Combobiler = {}));
