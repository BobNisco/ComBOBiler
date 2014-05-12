///<reference path="static_table_entry.ts" />
var Combobiler;
(function (Combobiler) {
    var StaticTable = (function () {
        function StaticTable() {
            this.tempIdRegex = /^(T[0-9])/;
            this.entries = new Array();
            this.currentTempNumber = 0;
            this.currentOffsetNumber = 0;
        }
        StaticTable.prototype.add = function (entry) {
            this.entries.push(entry);
            return entry;
        };

        StaticTable.prototype.getNextTempId = function () {
            return 'T' + this.currentTempNumber++;
        };

        StaticTable.prototype.getNextOffsetNumber = function () {
            return this.currentOffsetNumber++;
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

        StaticTable.prototype.findByTempId = function (tempId) {
            for (var i = 0; i < this.entries.length; i++) {
                if (this.entries[i].temp === tempId) {
                    return this.entries[i];
                }
            }
            return null;
        };

        StaticTable.prototype.backpatch = function (codeTable) {
            var currentEntry;
            var regexMatch;
            for (var i = 0; i < codeTable.entries.length; i++) {
                currentEntry = codeTable.entries[i];
                regexMatch = currentEntry.match(this.tempIdRegex);
                if (regexMatch) {
                    var entry = this.findByTempId(regexMatch[1]);
                    codeTable.add(Combobiler.CodeGenerator.leftPad((entry.offset + codeTable.currentPosition++).toString(16), 2), i);
                    codeTable.add('00', i + 1);
                }
            }
        };
        return StaticTable;
    })();
    Combobiler.StaticTable = StaticTable;
})(Combobiler || (Combobiler = {}));
