///<reference path="static_table_entry.ts" />

module Combobiler {
	export class StaticTable {
		public entries: Array<StaticTableEntry>;

		constructor() {
			this.entries = new Array<StaticTableEntry>();
		}
	}
}
