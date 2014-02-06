module Combobiler {
	export class Token {
		// TypeScript (like JS) does not have a difference between
		// an integer or a float/double.
		constructor(public symbol: string, public line: number) {

		}

		public toString() {
			return this.symbol + ' on line ' + this.line;
		}

		public static makeNewToken(symbol: string, line: number) {
			if (symbol == 'while') {
				return new While(line);
			} else if (symbol == '(') {
				return new LParen(line);
			} else if (symbol == ')') {
				return new RParen(line);
			} else if (symbol == '<') {
				return new LessThan(line);
			} else if (symbol == '>') {
				return new GreaterThan(line);
			} else if (symbol == '{') {
				return new OpenBrace(line);
			} else if (symbol == '}') {
				return new CloseBrace(line);
			} else if (symbol == '=') {
				return new Assignment(line);
			} else if (symbol == '+') {
				return new Plus(line);
			} else if (symbol == '-') {
				return new Minus(line);
			} else if (symbol == ';') {
				return new Semicolon(line);
			} else if (symbol == 'true') {
				return new True(line);
			} else if (symbol == 'false') {
				return new False(line);
			} else if (symbol == 'int') {
				return new Int(line);
			} else if (symbol == 'if') {
				return new If(line);
			} else if (symbol == 'string') {
				return new String(line);
			} else if (symbol == 'boolean') {
				return new Boolean(line);
			} else if (symbol == '==') {
				return new Equality(line);
			} else if (symbol == '!=') {
				return new NonEquality(line);
			} else if (/^\d+$/.exec(symbol) || /(\")[A-Za-z][A-Za-z0-9]*(\")/.exec(symbol)) {
				return new Value(line, symbol);
			} else if (/^[A-Za-z][A-Za-z0-9]*$/.exec(symbol)) {
				return new VariableIdentifier(line, symbol);
			} else if (/(\bprint\b)(\()([A-Za-z][A-Za-z0-9]*)(\))/.exec(symbol)) {
				var match = /(\bprint\b)(\()([A-Za-z][A-Za-z0-9]*)(\))/.exec(symbol);
				// Pass what's in between the parenthesis as a parameter
				return new Print(line, match[3]);
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

	export class Minus extends Token {
		constructor(line) {
			super('-', line);
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

	export class String extends Token {
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

	export class Value extends ValueToken {
		constructor(line, value) {
			super('value', line, value);
		}
	}

	export class Print extends ValueToken {
		constructor(line, value) {
			super('print', line, value);
		}
	}

	export class Char extends ValueToken {
		constructor(line, value) {
		    super('char', line, value);
		}
	}
}
