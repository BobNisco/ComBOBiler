var Combobiler;
(function (Combobiler) {
    var StaticTableEntry = (function () {
        function StaticTableEntry(temp, varId, address) {
            this.temp = temp;
            this.varId = varId;
            this.address = address;
        }
        return StaticTableEntry;
    })();
    Combobiler.StaticTableEntry = StaticTableEntry;
})(Combobiler || (Combobiler = {}));
