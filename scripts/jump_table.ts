///<reference path="jump_table_entry.ts" />

module Combobiler {
	export class JumpTable {
		public entries: Array<JumpTableEntry>;

		constructor () {
			this.entries = new Array<JumpTableEntry>();
		}
	}
}
