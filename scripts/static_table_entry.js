///<reference path="scope.ts" />
var Combobiler;
(function (Combobiler) {
    var StaticTableEntry = (function () {
        function StaticTableEntry(temp, varId, address, scope) {
            this.temp = temp;
            this.varId = varId;
            this.address = address;
            this.scope = scope;
        }
        return StaticTableEntry;
    })();
    Combobiler.StaticTableEntry = StaticTableEntry;
})(Combobiler || (Combobiler = {}));
