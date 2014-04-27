///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
///<reference path="logger.ts" />
///<reference path="lexer.ts" />
///<reference path="parser.ts" />
///<reference path="semantic_analyzer.ts" />

module Combobiler {
	export class Runner {

		public constructor() {

		}

		public run(source: string) {
			Runner.run(source);
		}

		public static run(source: string) {
			try {
				// Clear the tree displays so that the user is not shown improper trees
				SemanticAnalyzer.clearTreeDisplay();
				var lexer = new Combobiler.Lexer(source);
				var tokens = lexer.performLexicalAnalysis();

				if (tokens.length > 0) {
					// Only move onto parse if we returned tokens
					var parser = new Combobiler.Parser(tokens);
					var parseData = parser.performParse();
					var cstRootNode = parseData.rootNode;

					if (cstRootNode !== null) {
						// Only move onto Semantic Analysis if the CST isn't null
						var semanticAnalyzer = new Combobiler.SemanticAnalyzer(cstRootNode, null);
						semanticAnalyzer.performSemanticAnalysis();
					}
				}
			} catch (error) {
				return false;
			}
			return true;
		}

	}
}
