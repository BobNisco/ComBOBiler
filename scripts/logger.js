///<reference path="jquery.d.ts" />
var Combobiler;
(function (Combobiler) {
    var Logger = (function () {
        function Logger(textarea) {
            this.textarea = textarea;
            this.info('Logger initialized!');
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
        Logger.prototype.info = function (message) {
            this.log({
                displayClass: 'label-info',
                type: 'info',
                header: 'Info'
            }, message);
        };

        Logger.prototype.log = function (options, message) {
            this.textarea.prepend(this.createLogRow(options, message));
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
        return Logger;
    })();
    Combobiler.Logger = Logger;
})(Combobiler || (Combobiler = {}));
