///<reference path="jump_table_entry.ts" />
///<reference path="icode_gen_table.ts" />

module Combobiler {
	export class JumpTable implements ICodeGenTable<JumpTableEntry> {
		public entries: Array<JumpTableEntry>;
		public currentTempNumber: number;
		public tempIdRegex = /^(J[0-9])/;

		constructor () {
			this.entries = new Array<JumpTableEntry>();
			this.currentTempNumber = 0;
		}

		public add(entry: JumpTableEntry) {
			this.entries.push(entry);
			return entry;
		}

		public getNextTempId() {
			return 'J' + this.currentTempNumber++;
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
					codeTable.entries[i] = CodeGenerator.leftPad(entry.distance.toString(16), 2);
				}
			}
		}
	}
}
