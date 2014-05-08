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

        /**
        * Finds an entry in the array of entries by variable id
        * @param varId the variable id to search for
        * @return the StaticTableEntry instance if found, null otherwise
        */
        StaticTable.prototype.findByVarId = function (varId) {
            for (var entry in this.entries) {
                if (this.entries[entry].varId === varId) {
                    return this.entries[entry];
                }
            }
            return null;
        };
        return StaticTable;
    })();
    Combobiler.StaticTable = StaticTable;
})(Combobiler || (Combobiler = {}));
