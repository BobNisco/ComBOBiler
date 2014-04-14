///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />

module Combobiler {
	export class TreeNode {
		public children: Array<TreeNode>;
		constructor (public value: any, public parent: TreeNode) {
			this.children = new Array<TreeNode>();
		}

		public addChildNode(value: any) {
			var temp = new TreeNode(value, this);
			this.children.push(temp);
		}

		public addSiblingNode(value: any) {
			var temp = new TreeNode(value, this.parent);
			this.parent.children.push(temp);
		}

		public getNewestChild() {
			return this.children[this.children.length - 1];
		}

		public printTree() {
			console.log(this);
			for (var i in this.children) {
				this.children[i].printTree();
			}
		}

		public serializeTree() {
			var result = this.serializeNode();
			for (var i in this.children) {
				result += this.children[i].serializeTree();
			}
			return result;
		}

		public serializeNode() {
			if (this.value instanceof ValueToken) {
				return this.value.value;
			} else if (this.value instanceof Token) {
				return this.value.symbol;
			}
			return this.value;
		}
	}
}
