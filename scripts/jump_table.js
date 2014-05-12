///<reference path="jump_table_entry.ts" />
///<reference path="icode_gen_table.ts" />
var Combobiler;
(function (Combobiler) {
    var JumpTable = (function () {
        function JumpTable() {
            this.entries = new Array();
            this.currentTempNumber = 0;
        }
        JumpTable.prototype.add = function (entry) {
            this.entries.push(entry);
            return entry;
        };

        JumpTable.prototype.getNextTempId = function () {
            return 'J' + this.currentTempNumber++;
        };

        JumpTable.prototype.findByTempId = function (tempId) {
            for (var i = 0; i < this.entries.length; i++) {
                if (this.entries[i].temp === tempId) {
                    return this.entries[i];
                }
            }
            return null;
        };
        return JumpTable;
    })();
    Combobiler.JumpTable = JumpTable;
})(Combobiler || (Combobiler = {}));
