///<reference path="static_table_entry.ts" />

module Combobiler {
	export class StaticTable implements ICodeGenTable<StaticTableEntry> {
		public entries: Array<StaticTableEntry>;
		public currentTempNumber: number;
		public tempIdRegex = /^(T[0-9])/;
		private currentOffsetNumber: number;

		constructor() {
			this.entries = new Array<StaticTableEntry>();
			this.currentTempNumber = 0;
			this.currentOffsetNumber = 0;
		}

		public add(entry: StaticTableEntry) {
			this.entries.push(entry);
			return entry;
		}

		public getNextTempId() {
			return 'T' + this.currentTempNumber++;
		}

		public getNextOffsetNumber() {
			return this.currentOffsetNumber++;
		}

		/**
		 * Finds an entry in the array of entries by variable id
		 * @param varId the variable id to search for
		 * @return the StaticTableEntry instance if found, null otherwise
		 */
		public findByVarIdAndScope(varId: string, scope: Scope) {
			for (var i = 0; i < this.entries.length; i++) {
				var currentEntry = this.entries[i];
				// Match on the variable ID
				if (currentEntry.varId === varId) {
					// Check if the passed in scope matches this entry
					if (currentEntry.scope === scope) {
						return currentEntry;
					} else {
						var curScope = scope.parent;
						// Walk the tree until we find it, or hit the root,
						// or we don't find it at all.
						while (curScope != null) {
							if (currentEntry.scope === scope) {
								return currentEntry;
							}
							curScope = curScope.parent;
						}
					}
				}
			}
			return null;
		}

		public findByTempId(tempId: string) {
			for (var i = 0; i < this.entries.length; i++) {
				if (this.entries[i].temp === tempId) {
					return this.entries[i];
				}
			}
			return null;
		}

		public backpatch(codeTable: CodeTable) {
			var currentEntry;
			var regexMatch;
			for (var i = 0; i < codeTable.entries.length; i++) {
				currentEntry = codeTable.entries[i];
				regexMatch = currentEntry.match(this.tempIdRegex);
				if (regexMatch) {
					var entry = this.findByTempId(regexMatch[1]);
					codeTable.add(CodeGenerator.leftPad((entry.offset + codeTable.currentPosition + 1).toString(16), 2), i);
					codeTable.add('00', i + 1);
				}
			}
		}
	}
}
