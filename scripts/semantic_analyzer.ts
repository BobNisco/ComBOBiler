///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />

module Combobiler {
	export class SemanticAnalyzer {
		// Define some default logger options for the Semantic Analyzer
		private loggerOptions = {
			type: 'semantic-analyzer',
			header: 'Semantic Analysis',
		};

		private currentNode: TreeNode;

		constructor(private rootNode: TreeNode, private currentScope: Scope) {
			this.currentNode = this.rootNode;
		}

		public performSemanticAnalysis() {
			this.log({
				standard: '==== Semantic Analysis start ====',
				sarcastic: '==== Semantic Analysis start ===='
			});
			try {
				console.log(this.rootNode);
				this.analyzeProgram(this.rootNode);
				this.log({
					standard: '==== Semantic Analysis end ====',
					sarcastic: '==== Semantic Analysis end ===='
				});
			} catch (error) {
				this.error({
					standard: error,
					sarcastic: error,
				});

				this.error({
					standard: '==== Semantic Analysis ended due to error ====',
					sarcastic: '==== Semantic Analysis ended due to error ===='
				});
			}
		}

		private analyzeProgram(node) {
			this.analyzeBlock(node.children[0]);
		}

		private analyzeBlock(node) {
			// TODO: Create new scope
		}

		private analyzeWhileStatement(node) {
			this.analyzeBooleanExpression(node.children[0]);
			this.analyzeBlock(node.children[1]);
		}

		private analyzePrintStatement(node) {

		}

		private analyzeBooleanExpression(node) {

		}

		/**
		 * Internal handler for passing our log message to the logger. This method should
		 * be used for non-errors in the parser.
		 *
		 * @param message the text to be put into the output field
		 */
		private log(messages: Object) {
			LOGGER.log($.extend({displayClass: 'label-info'}, this.loggerOptions), messages);
		}

		/**
		 * Internal handler for passsing our error message to the logger. This method
		 * should be used for errors in the parser.
		 *
		 * @param message the text to be put into the output field
		 */
		private error(messages: Object) {
			LOGGER.log($.extend({displayClass: 'label-danger'}, this.loggerOptions), messages);
		}
	}
}
