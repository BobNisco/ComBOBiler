///<reference path="jump_table_entry.ts" />
///<reference path="icode_gen_table.ts" />

module Combobiler {
	export class JumpTable implements ICodeGenTable<JumpTableEntry> {
		public entries: Array<JumpTableEntry>;
		public currentTempNumber: number;

		constructor () {
			this.entries = new Array<JumpTableEntry>();
			this.currentTempNumber = 0;
		}

		public add(entry: JumpTableEntry) {
			this.entries.push(entry);
		}

		public getNextTempId() {
			return 'J' + this.currentTempNumber++;
		}
	}
}
