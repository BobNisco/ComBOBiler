var Combobiler;
(function (Combobiler) {
    var CodeTable = (function () {
        function CodeTable() {
            this.entries = new Array(CodeTable.CODE_TABLE_SIZE);
        }
        /**
        * Finalizes the code table by putting 0x00 into each spot that isn't occupied.
        * Should be run after back-patching is completed
        */
        CodeTable.prototype.finalizeCodeTable = function () {
            for (var i = 0; i < CodeTable.CODE_TABLE_SIZE; i++) {
                if (this.entries[i] === null || this.entries[i] === undefined) {
                    this.entries[i] = "00";
                }
            }
        };

        /**
        * Generates a nicely formatted string version of the code table (8 x 32)
        *
        * @return string version of the code table
        */
        CodeTable.prototype.createStringForDisplay = function () {
            var returnString = '';
            for (var i = 0; i < CodeTable.CODE_TABLE_SIZE; i++) {
                if (i % 8 === 0 && i !== 0) {
                    returnString += '\n';
                }
                returnString += this.entries[i] + ' ';
            }
            return returnString;
        };

        /**
        * Internal handler for adding code to the table.
        * Performs special checking to ensure code that is added is valid
        *
        * @param data the data (hex) to be added to the code table
        * @param position the position (base-10, 0-indexed) in the codeTable to add the data to
        */
        CodeTable.prototype.add = function (data, position) {
            // Uppercase all the letters so that it's uniform regardless
            data.toUpperCase();

            if (!data.match(/^[0-9A-G]{2}/)) {
                throw new Error('Tried to place the data string ' + data + ' in code table, but it is not 2 valid hex characters');
            }
            if (position >= CodeTable.CODE_TABLE_SIZE || position < 0) {
                throw new Error('Position ' + position + ' is invalid for our code table');
            }
            this.entries[position] = data;
        };
        CodeTable.CODE_TABLE_SIZE = 256;
        return CodeTable;
    })();
    Combobiler.CodeTable = CodeTable;
})(Combobiler || (Combobiler = {}));
