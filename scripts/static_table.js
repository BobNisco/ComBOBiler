///<reference path="static_table_entry.ts" />
var Combobiler;
(function (Combobiler) {
    var StaticTable = (function () {
        function StaticTable() {
            this.entries = new Array();
            this.currentTempNumber = 0;
        }
        StaticTable.prototype.add = function (entry) {
            this.entries.push(entry);
        };

        StaticTable.prototype.getNextTempId = function () {
            return 'T' + this.currentTempNumber++;
        };
        return StaticTable;
    })();
    Combobiler.StaticTable = StaticTable;
})(Combobiler || (Combobiler = {}));
