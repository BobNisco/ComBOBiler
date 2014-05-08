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

		/**
		 * Finds an entry in the array of entries by variable id
		 * @param varId the variable id to search for
		 * @return the StaticTableEntry instance if found, null otherwise
		 */
		public findByVarId(varId: string) {
			for (var entry in this.entries) {
				if (this.entries[entry].varId === varId) {
					return this.entries[entry];
				}
			}
			return null;
		}
	}
}
