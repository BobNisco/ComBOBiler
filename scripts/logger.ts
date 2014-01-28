///<reference path="jquery.d.ts" />

module Combobiler {
	export class Logger {
		constructor (public textarea: JQuery) {

		}

		/**
		 * Clears all of the text in the output field
		 */
		public clear() {
			this.textarea.html('');
		}

		/**
		 * Puts an info message into the output field
		 *
		 * @param message the text to be put into the output field
		 */
		public info(message: string) {
			this.textarea.append(message + '&#10;');
		}
	}
}
