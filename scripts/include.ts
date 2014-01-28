// Some global variables that will be initialized once the page is fully loaded
var LOGGER = null;

$(document).ready(function(){
	var compileButton = $('#compile-button');
	var taSourceCode = $('#taSourceCode');
	var taOutput = $('#taOutput');
	var programTable = $('#program-table');
	// Instantiate a new instance of our logger class by passing in
	// the textarea that we want to use
	LOGGER = new Combobiler.Logger(taOutput);

	compileButton.on('click', function(e) {
		e.preventDefault();
		LOGGER.clear();
		LOGGER.headerInfo('Compilation started');
		var lexer = new Combobiler.Lexer(taSourceCode.val());
		lexer.performLexicalAnalysis();
	});

	programTable.on('click', '.user-program', function(e) {
		e.preventDefault();

		var button = $(this);
		taSourceCode.val(button.data('program'));
	});
});
