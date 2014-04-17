///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />
var Combobiler;
(function (Combobiler) {
    var ScopeNode = (function () {
        function ScopeNode(value, type) {
            this.value = value;
            this.type = type;
            this.used = false;
        }
        ScopeNode.prototype.setValue = function (value) {
            this.value = value;
        };

        ScopeNode.prototype.setType = function (type) {
            this.type = type;
        };

        ScopeNode.prototype.getValue = function () {
            return this.value;
        };

        ScopeNode.prototype.getType = function () {
            return this.type;
        };

        ScopeNode.prototype.toString = function () {
            return 'value: ' + this.value + ', type: ' + this.type;
        };
        return ScopeNode;
    })();
    Combobiler.ScopeNode = ScopeNode;
})(Combobiler || (Combobiler = {}));
