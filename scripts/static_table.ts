///<reference path="static_table_entry.ts" />

module Combobiler {
	export class StaticTable {
		public entries: Array<StaticTableEntry>;
		public currentTempNumber: number;

		constructor() {
			this.entries = new Array<StaticTableEntry>();
			this.currentTempNumber = 0;
		}

		public add(entry: StaticTableEntry) {
			this.entries.push(entry);
		}

		public getNextTempId() {
			return 'T' + this.currentTempNumber++;
		}
	}
}
