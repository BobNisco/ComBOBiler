///<reference path="scope.ts" />

module Combobiler {
	export class StaticTableEntry {
		constructor(public temp: string, public varId: string, public offset: number, public scope: Scope) {

		}
	}
}
