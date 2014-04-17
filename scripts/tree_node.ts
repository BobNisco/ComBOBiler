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

		/**
		 * A recursive function will return the tree starting from this
		 * into notation expected by SynTree.js
		 */
		public toSynTree() {
			var result = '[';
			// This monstrosity properly prints out any of the possible
			// values that could be on the CST/AST.
			// TODO: Drink a Red Bull and refactor at some point
			if (this.value instanceof TreeNode) {
				if (this.value.value instanceof ValueToken) {
					// Enough values?
					// TODO: Get more creative with my naming conventions
					result += this.value.value.value;
				} else if (this.value.value instanceof Token) {
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
		}

		public evaluateNode() {
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
		}
	}
}
