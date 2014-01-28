///<reference path="jquery.d.ts" />
var Combobiler;
(function (Combobiler) {
    var Logger = (function () {
        function Logger(textarea) {
            this.textarea = textarea;
        }
        Logger.prototype.info = function (message) {
            this.textarea.append(message + '&#10;');
        };
        return Logger;
    })();
    Combobiler.Logger = Logger;
})(Combobiler || (Combobiler = {}));
