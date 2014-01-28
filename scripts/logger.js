///<reference path="jquery.d.ts" />
var Combobiler;
(function (Combobiler) {
    var Logger = (function () {
        function Logger(textarea) {
            this.textarea = textarea;
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
            this.textarea.append(message + '&#10;');
        };
        return Logger;
    })();
    Combobiler.Logger = Logger;
})(Combobiler || (Combobiler = {}));
