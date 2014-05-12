///<reference path="scope.ts" />
var Combobiler;
(function (Combobiler) {
    var StaticTableEntry = (function () {
        function StaticTableEntry(temp, varId, offset, scope) {
            this.temp = temp;
            this.varId = varId;
            this.offset = offset;
            this.scope = scope;
        }
        return StaticTableEntry;
    })();
    Combobiler.StaticTableEntry = StaticTableEntry;
})(Combobiler || (Combobiler = {}));
