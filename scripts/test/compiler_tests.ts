/// <reference path="../vendor/tsUnit.ts" />
/// <reference path="../runner.ts" />
/// <reference path="../parser.ts" />
/// <reference path="../lexer.ts" />

module Combobiler {
	export class CompilerTests extends tsUnit.TestClass {
		private target = new Lexer('');

		printHelloWorldLex() {
			this.target = new Lexer('{ print("hello world") } $', true);

			var result = this.target.performLexicalAnalysis();

			var expected = [
				Token.makeNewToken("{", 1),
				Token.makeNewToken("print", 1),
				Token.makeNewToken('(', 1),
				Token.makeNewToken("\"hello world\"", 1),
				Token.makeNewToken(")", 1),
				Token.makeNewToken("}", 1),
				Token.makeNewToken("$", 1),
			];

			// Compare the token values and assert that they are equal
			for (var i in result) {
				if (result[i] instanceof ValueToken) {
					this.areIdentical(result[i].value, expected[i].value);
				} else {
					this.areIdentical(result[i].symbol, expected[i].symbol);
				}
			}
		}
	}
}

// new instance of tsUnit
var test = new tsUnit.Test();

// add your test class (you can call this multiple times)
test.addTestClass(new Combobiler.CompilerTests());

// Use the built in results display
test.showResults(document.getElementById('results'), test.run());
