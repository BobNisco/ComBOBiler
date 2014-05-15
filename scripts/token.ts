module Combobiler {
	export class Token {

		/**
		 * Define our regex for identifying certain tokens as static variables
		 * so that we can reference them from other classes if need be.
		 */
		public static numberRegex = /^\d+$/;
		public static stringRegex = /(\")[A-Za-z\s]*(\")/;
		public static identifierRegex = /^[a-z]{1}$/;
		public static intRegex = /^0$|^[1-9]\d*$/;

		// TypeScript (like JS) does not have a difference between
		// an integer or a float/double.
		constructor(public symbol: string, public line: number) {

		}

		public toString() {
			return this.symbol + ' on line ' + this.line;
		}

		/**
		 * A simple way to easily create new tokens for reserved symbols
		 */
		private static symbolMapping = function(symbol: string, line: number) {
			// Make an associative array where the keys are the reserved symbols
			// and the value is an anonymous, self-invoking function that returns
			// the proper Token
			var tokens = {
				'while': function() { return new While(line); }(),
				'(': function() { return new LParen(line); }(),
				')': function() { return new RParen(line); }(),
				'<': function() { return new LessThan(line); }(),
				'>': function() { return new GreaterThan(line); }(),
				'{': function() { return new OpenBrace(line); }(),
				'}': function() { return new CloseBrace(line); }(),
				'=': function() { return new Assignment(line); }(),
				'+': function() { return new Plus(line); }(),
				';': function() { return new Semicolon(line); }(),
				'true': function() { return new True(line); }(),
				'false': function() { return new False(line); }(),
				'int': function() { return new Int(line); }(),
				'if': function() { return new If(line); }(),
				'string': function() { return new MyString(line); }(),
				'boolean': function() { return new Boolean(line); }(),
				'==': function() { return new Equality(line); }(),
				'!=': function() { return new NonEquality(line); }(),
				'$': function() { return new EndBlock(line); }(),
				'print': function() { return new Print(line); }(),
			}
			return tokens[symbol];
		}

		/**
		 * A function that will return a new Token of the proper subclass
		 * depending on what symbol was passed in to it.
		 *
		 * @param symbol the string of characters that we are attempting to
		 *        match against
		 * @param line the line number in which the symbol was found
		 */
		public static makeNewToken(symbol: string, line: number) {
			var possibleToken = Token.symbolMapping(symbol, line);
			if (possibleToken !== undefined) {
				return possibleToken;
			}

			if (Token.intRegex.exec(symbol)) {
				return new IntValue(line, symbol);
			} else if (Token.stringRegex.exec(symbol)) {
				return new StringValue(line, symbol);
			} else if (Token.identifierRegex.exec(symbol)) {
				return new VariableIdentifier(line, symbol);
			} else {
				// TODO: Handle errors better
				return null;
			}
		}
	}

	export class While extends Token {
		constructor(line) {
			super('while', line);
		}
	}

	export class LParen extends Token {
		constructor(line) {
			super('(', line);
		}
	}

	export class RParen extends Token {
		constructor(line) {
			super(')', line);
		}
	}

	export class LessThan extends Token {
		constructor(line) {
			super('<', line);
		}
	}

	export class GreaterThan extends Token {
		constructor(line) {
			super('>', line);
		}
	}

	export class OpenBrace extends Token {
		constructor(line) {
			super('{', line);
		}
	}

	export class CloseBrace extends Token {
		constructor(line) {
			super('}', line);
		}
	}

	export class Assignment extends Token {
		constructor(line) {
			super('=', line);
		}
	}

	export class Plus extends Token {
		constructor(line) {
			super('+', line);
		}
	}

	export class Semicolon extends Token {
		constructor(line) {
			super(';', line);
		}
	}

	export class True extends Token {
		constructor(line) {
			super('true', line);
		}
	}

	export class False extends Token {
		constructor(line) {
			super('false', line);
		}
	}

	export class Int extends Token {
		constructor(line) {
			super('int', line);
		}
	}

	export class If extends Token {
		constructor(line) {
			super('if', line);
		}
	}

	export class MyString extends Token {
		constructor(line) {
			super('string', line);
		}
	}

	export class Boolean extends Token {
		constructor(line) {
			super('boolean', line);
		}
	}

	export class Equality extends Token {
		constructor(line) {
			super('==', line);
		}
	}

	export class NonEquality extends Token {
		constructor(line) {
			super('!=', line);
		}
	}

	export class EndBlock extends Token {
		constructor(line) {
			super('$', line);
		}
	}

	export class Print extends Token {
		constructor(line) {
		    super('print', line);
		}
	}

	/**
	 * A subclass of the Token object meant for tokens who need to
	 * store a value in them.
	 */
	export class ValueToken extends Token {
		constructor(symbol, line, public value: string) {
			super(symbol, line);
		}

		public toString() {
			return this.symbol + '(' + this.value + ') on line ' + this.line;
		}
	}

	export class VariableIdentifier extends ValueToken {
		constructor(line, value) {
			super('varid', line, value);
		}
	}

	export class StringValue extends ValueToken {
		constructor(line, value) {
			super('string value', line, value);
		}
	}

	export class IntValue extends ValueToken {
		constructor(line, value) {
			super('int value', line, value);
		}
	}

	export class Char extends ValueToken {
		constructor(line, value) {
		    super('char', line, value);
		}
	}
}
