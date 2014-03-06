///<reference path="jquery.d.ts" />
var Combobiler;
(function (Combobiler) {
    var Logger = (function () {
        function Logger(textarea, personality) {
            this.textarea = textarea;
            this.personality = personality;
            this.info({
                standard: 'Logger initialized!',
                sarcastic: 'Logger initialized!'
            });
        }
        /**
        * Clears all of the text in the output field
        */
        Logger.prototype.clear = function () {
            this.textarea.html('');
        };

        /**
        * Puts an info message into the output field
        *
        * @param message the text to be put into the output field
        */
        Logger.prototype.info = function (messages) {
            this.log({
                displayClass: 'label-info',
                type: 'info',
                header: 'Info'
            }, messages);
        };

        Logger.prototype.log = function (options, messages) {
            var logString;
            if (this.getPersonality() == 'neckbeard') {
                logString = this.stringToBinary(messages['standard']);
            } else if (this.getPersonality() === 'yoda') {
                logString = this.stringToYoda(messages['standard']);
            } else {
                logString = messages[this.getPersonality()];
            }
            this.textarea.prepend(this.createLogRow(options, logString));
        };

        Logger.prototype.getPersonality = function () {
            return this.personality.val();
        };

        /**
        * The internal handler for creating the log rows.
        *
        * @param type the type of log row this is. The value will be used to filter
        *        by type on the GUI.
        * @param header the text that will appear in the label of the log row
        * @param message the text to be put into the output field
        */
        Logger.prototype.createLogRow = function (options, message) {
            return '<div class="log-row" data-type="' + options.type + '" data-header="' + options.header + '"><span class="label ' + options.displayClass + '">' + options.header + '</span> ' + message + ' <small class="pull-right">' + this.prettyPrintDateTime() + '</div>';
        };

        /**
        * Pretty prints the date and time
        *
        * @param currentDateTime (optional) the date to be pretty printed.
        If no date is passed in, then it will default to the current date.
        */
        Logger.prototype.prettyPrintDateTime = function (currentDateTime) {
            if (typeof currentDateTime === "undefined") { currentDateTime = new Date(); }
            return (currentDateTime.getMonth() + 1) + "/" + currentDateTime.getDate() + "/" + currentDateTime.getFullYear() + " | " + currentDateTime.getHours() + ":" + ('0' + currentDateTime.getMinutes()).slice(-2) + ":" + ('0' + currentDateTime.getSeconds()).slice(-2);
        };

        Logger.prototype.stringToBinary = function (text) {
            var hex = "";
            for (var i = 0; i < text.length; i++) {
                hex += text.charCodeAt(i).toString(2) + ' ';
            }
            return hex;
        };

        /**
        * Shuffles a sentence around, split by spaces. Doesn't actually
        * take Yoda's grammar into account. Sorry. Close enough though.
        *
        * @param text the sentence to be shuffled
        *
        * @return a shuffled string
        */
        Logger.prototype.stringToYoda = function (text) {
            var o = text.split(' ');

            for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = $.trim(o[j]), o[j] = x)
                ;

            // Join the shuffled array back into a "sentence" and return it
            return o.join(' ');
        };
        return Logger;
    })();
    Combobiler.Logger = Logger;
})(Combobiler || (Combobiler = {}));
