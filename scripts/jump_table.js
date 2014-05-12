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
        };

        JumpTable.prototype.getNextTempId = function () {
            return 'J' + this.currentTempNumber++;
        };
        return JumpTable;
    })();
    Combobiler.JumpTable = JumpTable;
})(Combobiler || (Combobiler = {}));
