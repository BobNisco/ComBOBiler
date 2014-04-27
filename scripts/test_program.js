///<reference path="jquery.d.ts" />
var Combobiler;
(function (Combobiler) {
    var TestProgram = (function () {
        function TestProgram(description, program) {
            this.description = description;
            this.program = program;
        }
        return TestProgram;
    })();
    Combobiler.TestProgram = TestProgram;
})(Combobiler || (Combobiler = {}));
