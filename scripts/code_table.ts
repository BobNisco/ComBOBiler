module Combobiler {
	export class CodeTable {
		// Set the expected size of the code table. This should match up with the
		// program size on the OS. Since MS-BOS has a default program size of 256,
		// we will match that for our compiler.
		public static CODE_TABLE_SIZE = 256;
		public entries: Array<string>;
		// Keep track of what positions we are currently writing to
		public currentPosition: number;
		public currentHeapPosition: number;

		constructor() {
			this.entries = new Array<string>(CodeTable.CODE_TABLE_SIZE);
			this.currentPosition = 0;
			this.currentHeapPosition = this.entries.length - 1;
		}

		/**
		 * Finalizes the code table by putting 0x00 into each spot that isn't occupied.
		 * Should be run after back-patching is completed
		 */
		public finalizeCodeTable() {
			for (var i = 0; i < CodeTable.CODE_TABLE_SIZE; i++) {
				if (this.entries[i] === null || this.entries[i] === undefined) {
					this.entries[i] = "00";
				}
			}
		}

		/**
		 * Generates a nicely formatted string version of the code table (8 x 32)
		 *
		 * @return string version of the code table
		 */
		public createStringForDisplay() {
			var returnString = '';
			for (var i = 0; i < CodeTable.CODE_TABLE_SIZE; i++) {
				if (i % 8 === 0 && i !== 0) {
					returnString += '\n';
				}
				returnString += this.entries[i] + ' ';
			}
			return returnString;
		}

		public addCode(data: string) {
			this.add(data, this.currentPosition);
			return this.currentPosition++;
		}

		public addHeapData(data: string) {
			this.add(data, this.currentHeapPosition);
			return this.currentHeapPosition--;
		}

		private findStringInHeap(data: string) {
			var curString = '';
			for (var i = CodeTable.CODE_TABLE_SIZE - 1; i >= this.currentHeapPosition - 1; i--) {
				if (this.entries[i] === '00') {
					if (curString === data) {
						return curString;
					}
				} else {
					curString = curString + String.fromCharCode(parseInt(this.entries[i], 16));
				}
			}
			return null;
 		}

		public addString(str: string) {
			// Strip the double quotes
			var theString = str.value.value.replace(/\"/g, '');
			var position;
			if (theString.length <= 0) {
				position = this.addHeapData('00');
			}
			// Null terminated string
			this.addHeapData('00');
			for (var i = theString.length - 1; i >= 0; i--) {
				var hex = theString.charCodeAt(i).toString(16);
				position = this.addHeapData(hex);
			}
			return position;
		}

		/**
		 * Check to ensure that our heap/static/code sections haven't collided
		 * If they have collided, we'll throw an exception
		 */
		private checkForCollision() {
			if (this.currentPosition >= this.currentHeapPosition) {
				throw new Error('Ran out of space in our code table! Program too long!');
			}
		}

		/**
		 * Internal handler for adding code to the table.
		 * Performs special checking to ensure code that is added is valid
		 *
		 * @param data the data (hex) to be added to the code table
		 * @param position the position (base-10, 0-indexed) in the codeTable to add the data to
		 */
		public add(data: string, position: number) {
			// Uppercase all the letters so that it's uniform regardless
			data = data.toUpperCase();

			if (!(data.match(/^[0-9A-G]{2}/) || data.match(/^T[0-9]/) || data.match(/^J[0-9]/) || data.match(/^XX$/))) {
				throw new Error('Tried to place the data string ' + data + ' in code table, but it is not 2 valid hex characters nor is it valid temp variable data');
			}
			if (position >= CodeTable.CODE_TABLE_SIZE || position < 0) {
				throw new Error('Position ' + position + ' is invalid for our code table');
			}
			this.checkForCollision();
			this.entries[position] = data;
			return position;
		}
	}
}
