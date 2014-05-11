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
        StaticTable.prototype.findByVarIdAndScope = function (varId, scope) {
            for (var i = 0; i < this.entries.length; i++) {
                var currentEntry = this.entries[i];

                // Match on the variable ID
                if (currentEntry.varId === varId) {
                    // Check if the passed in scope matches this entry
                    if (currentEntry.scope == scope) {
                        return currentEntry;
                    } else {
                        while (scope.parent !== null) {
                            scope = scope.parent;
                            if (currentEntry.scope == scope) {
                                return currentEntry;
                            }
                        }
                    }
                }
            }
            return null;
        };
        return StaticTable;
    })();
    Combobiler.StaticTable = StaticTable;
})(Combobiler || (Combobiler = {}));
