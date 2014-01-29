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
            this.textarea.prepend(this.createLogRow('info', 'Info', message));
        };

        Logger.prototype.error = function (message) {
            this.textarea.prepend(this.createLogRow('error', 'Error', message));
        };

        Logger.prototype.createLogRow = function (type, header, message) {
            var displayClass = "";
            if (type === 'info') {
                displayClass = 'label-info';
            } else if (type === 'error') {
                displayClass = 'label-danger';
            }
            return '<div class="log-row" data-type="' + type + '"><span class="label ' + displayClass + '">' + header + '</span> ' + message + ' <small class="pull-right">' + this.prettyPrintDate() + '</div>';
        };

        Logger.prototype.prettyPrintDate = function () {
            var currentdate = new Date();
            return (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + "/" + currentdate.getFullYear() + " | " + currentdate.getHours() + ":" + ('0' + currentdate.getMinutes()).slice(-2) + ":" + ('0' + currentdate.getSeconds()).slice(-2);
        };
        return Logger;
    })();
    Combobiler.Logger = Logger;
})(Combobiler || (Combobiler = {}));
