///<reference path="jquery.d.ts" />

module Combobiler {
	export class Logger {
		constructor (public textarea: JQuery) {

		}

		public info(message: string) {
			this.textarea.append(message + '&#10;');
		}
	}
}
