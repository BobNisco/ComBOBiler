module Combobiler {
	export class Token {
		public symbol: string;

		constructor(s: string) {
			this.symbol = s;
		}
	}

	export class While extends Token {
		constructor() {
			super('while');
		}
	}

	export class LParen extends Token {
		constructor() {
			super('(');
		}
	}

	export class RParen extends Token {
		constructor() {
			super(')');
		}
	}

	export class LessThan extends Token {
		constructor() {
			super('<');
		}
	}

	export class GreaterThan extends Token {
		constructor() {
			super('>');
		}
	}

	export class OpenBrace extends Token {
		constructor() {
			super('{');
		}
	}

	export class CloseBrace extends Token {
		constructor() {
			super('}');
		}
	}

	export class Assignment extends Token {
		constructor() {
			super('=');
		}
	}

	export class Plus extends Token {
		constructor() {
			super('+');
		}
	}

	export class Minus extends Token {
		constructor() {
			super('-');
		}
	}

	export class Multiply extends Token {
		constructor() {
			super('*');
		}
	}

	export class Divide extends Token {
		constructor() {
			super('/');
		}
	}

	export class Semicolon extends Token {
		constructor() {
			super(';');
		}
	}
}
