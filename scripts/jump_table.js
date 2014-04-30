///<reference path="jump_table_entry.ts" />
var Combobiler;
(function (Combobiler) {
    var JumpTable = (function () {
        function JumpTable() {
            this.entries = new Array();
        }
        return JumpTable;
    })();
    Combobiler.JumpTable = JumpTable;
})(Combobiler || (Combobiler = {}));
