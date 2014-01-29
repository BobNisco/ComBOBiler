///<reference path="jquery.d.ts" />

module Combobiler {
	export class Logger {
		constructor (public textarea: JQuery) {
			this.info('Logger initialized!');
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
			this.textarea.prepend(this.createLogRow('info', 'Info', message));
		}

		private createLogRow(type: string, header: string, message: string) {
			var displayClass = "";
			if (type === 'info') {
				displayClass = 'label-info';
			} else if (type === 'error') {
				displayClass = 'label-danger';
			}
			return '<div class="log-row" data-type="' + type + '"><span class="label ' + displayClass + '">'
				   + header + '</span> ' + message + ' <small class="pull-right">' + this.prettyPrintDate() + '</div>';
		}

		private prettyPrintDate() {
			var currentdate = new Date();
			return (currentdate.getMonth()+1)  + "/"
                + currentdate.getDate() + "/"
                + currentdate.getFullYear() + " | "
                + currentdate.getHours() + ":"
                + ('0' + currentdate.getMinutes()).slice(-2) + ":"
                + ('0' + currentdate.getSeconds()).slice(-2);
		}
	}
}
