/**
 * Interface for our static and jump tables in code generation
 */
module Combobiler {
	export interface ICodeGenTable<E> {
		entries: Array<E>;
		currentTempNumber: number;
		tempIdRegex: RegExp;

		add(entry: E): E;
		getNextTempId(): string;
		backpatch(codeTable: CodeTable): void;
	}
}
