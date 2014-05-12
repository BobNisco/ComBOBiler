///<reference path="jump_table_entry.ts" />
///<reference path="icode_gen_table.ts" />
var Combobiler;
(function (Combobiler) {
    var JumpTable = (function () {
        function JumpTable() {
            this.tempIdRegex = /^(J[0-9])/;
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

        JumpTable.prototype.backpatch = function (codeTable) {
            var currentEntry;
            var regexMatch;
            for (var i = 0; i < codeTable.entries.length; i++) {
                currentEntry = codeTable.entries[i];
                regexMatch = currentEntry.match(this.tempIdRegex);
                if (regexMatch) {
                    var entry = this.findByTempId(regexMatch[1]);
                    codeTable.add(Combobiler.CodeGenerator.leftPad(entry.distance.toString(16), 2), i);
                }
            }
        };
        return JumpTable;
    })();
    Combobiler.JumpTable = JumpTable;
})(Combobiler || (Combobiler = {}));
