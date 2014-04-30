var Combobiler;
(function (Combobiler) {
    var JumpTableEntry = (function () {
        function JumpTableEntry(temp, distance) {
            this.temp = temp;
            this.distance = distance;
        }
        return JumpTableEntry;
    })();
    Combobiler.JumpTableEntry = JumpTableEntry;
})(Combobiler || (Combobiler = {}));
