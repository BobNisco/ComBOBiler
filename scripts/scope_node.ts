///<reference path="token.ts" />
///<reference path="jquery.d.ts" />
///<reference path="include.ts" />

module Combobiler {
	export class ScopeNode {
		private used: boolean;

		constructor(private value: any, private type: any) {
			this.used = false;
		}

		public setValue(value: any) {
			this.value = value;
		}

		public setType(type: any) {
			this.type = type;
		}

		public getValue() {
			return this.value;
		}

		public getType() {
			return this.type;
		}

		public toString() {
			return 'value: ' + this.value + ', type: ' + this.type;
		}
	}
}
