module Combobiler {
	export class Token {
		// TypeScript (like JS) does not have a difference between
		// an integer or a float/double.
		constructor(public symbol: string, public line: number) {

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

	export class Multiply extends Token {
		constructor(line) {
			super('*', line);
		}
	}

	export class Divide extends Token {
		constructor(line) {
			super('/', line);
		}
	}

	export class Semicolon extends Token {
		constructor(line) {
			super(';', line);
		}
	}
}
