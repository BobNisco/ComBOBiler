///<reference path="jquery.d.ts" />

module Combobiler {
	export class Logger {
		constructor (public textarea: JQuery, private personality: JQuery) {
			this.info({
				standard: 'Logger initialized!',
				sarcastic: 'Logger initialized!'
			});
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
		public info(messages: Object) {
			this.log({
					displayClass: 'label-info',
					type: 'info',
					header: 'Info',
				}, messages);
		}

		public log(options: Object, messages: Object) {
			var logString: string;
			if (this.getPersonality() == 'neckbeard') {
				logString = this.stringToBinary(messages['standard']);
			} else {
				logString = messages[this.getPersonality()];
			}
			this.textarea.prepend(this.createLogRow(options, logString));
		}

		public getPersonality() {
			return this.personality.val();
		}

		/**
		 * The internal handler for creating the log rows.
		 *
		 * @param type the type of log row this is. The value will be used to filter
		 *        by type on the GUI.
		 * @param header the text that will appear in the label of the log row
		 * @param message the text to be put into the output field
		 */
		private createLogRow(options: any, message: string) {
			return '<div class="log-row" data-type="' + options.type + '" data-header="'
				   + options.header + '"><span class="label ' + options.displayClass + '">'
				   + options.header + '</span> ' + message + ' <small class="pull-right">'
				   + this.prettyPrintDateTime() + '</div>';
		}

		/**
		 * Pretty prints the date and time
		 *
		 * @param currentDateTime (optional) the date to be pretty printed.
		          If no date is passed in, then it will default to the current date.
		 */
		private prettyPrintDateTime(currentDateTime: any = new Date()) {
			return (currentDateTime.getMonth()+1)  + "/"
                + currentDateTime.getDate() + "/"
                + currentDateTime.getFullYear() + " | "
                + currentDateTime.getHours() + ":"
                + ('0' + currentDateTime.getMinutes()).slice(-2) + ":"
                + ('0' + currentDateTime.getSeconds()).slice(-2);
		}

		private stringToBinary(text: string) {
			var hex: string = "";
			for (var i = 0; i < text.length; i++) {
				hex += text.charCodeAt(i).toString(2) + ' ';
			}
			return hex;
		}
	}
}
