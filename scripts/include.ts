///<reference path="jquery.d.ts" />
///<reference path="logger.ts" />
///<reference path="lexer.ts" />

// Some global variables that will be initialized once the page is fully loaded
var LOGGER = null;

$(document).ready(function(){
	var compileButton = $('#compile-button'),
		taSourceCode = $('#taSourceCode'),
		taOutput = $('#taOutput'),
		logOutput = $('#logOutput'),
		programTable = $('#program-table'),
		logFilterType = $('#log-filter-type'),
		logFilterStatus = $('#log-filter-status'),
		clearLogButton = $('#clear-log-button'),
		logPersonality = $('#log-personality');
	// Instantiate a new instance of our logger class by passing in
	// the div that we want to use and the personality selector
	LOGGER = new Combobiler.Logger(logOutput, logPersonality);

	compileButton.on('click', function(e) {
		e.preventDefault();
		LOGGER.info({
			standard: 'Compilation started',
			sarcastic: 'Compilation started'
		});
		var lexer = new Combobiler.Lexer(taSourceCode.val());
		var tokens = lexer.performLexicalAnalysis();
		var parser = new Combobiler.Parser(tokens);
		parser.performParse();
	});

	programTable.on('click', '.user-program', function(e) {
		e.preventDefault();

		var button = $(this);
		taSourceCode.val(button.data('program'));
	});

	logFilterType.on('change', function(e) {
		e.preventDefault();
		var dropdown = $(this),
			logEntries = logOutput.find('.log-row');
		$.each(logEntries, function(i, val) {
			var thisRow = $(val);
			thisRow.show();
			if (!determineIfRowShouldBeDisplayed(thisRow)) {
				thisRow.hide();
			}
		});
	});

	logFilterStatus.on('change', function(e) {
		e.preventDefault();
		var dropdown = $(this),
			logEntries = logOutput.find('.label');
		$.each(logEntries, function(i, val) {
			var thisLabel = $(val),
				thisRow = thisLabel.parent();
			thisRow.show();
			if (!determineIfRowShouldBeDisplayed(thisRow)) {
				thisRow.hide();
			}
		});
	});

	var determineIfRowShouldBeDisplayedForType = function(selectedValue, thisRow) {
		return !(selectedValue !== '-' && thisRow.data('type') !== selectedValue);
	}

	var determineIfRowShouldBeDisplayedForStatus = function(selectedValue, thisLabel) {
		return !(selectedValue !== '-' && !thisLabel.hasClass(selectedValue))
	}

	var determineIfRowShouldBeDisplayed = function(row) {
		var currentFilterType = logFilterType.val(),
			currentFilterStatus = logFilterStatus.val(),
			thisLabel = row.find('.label');
		return (determineIfRowShouldBeDisplayedForStatus(currentFilterStatus, thisLabel) &&
				determineIfRowShouldBeDisplayedForType(currentFilterType, row))
	}

	clearLogButton.on('click', function(e) {
		e.preventDefault();
		logOutput.empty();
	});
});
