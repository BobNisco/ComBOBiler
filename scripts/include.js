// Some global variables that will be initialized once the page is fully loaded
var LOGGER = null;

$(document).ready(function () {
    var compileButton = $('#compile-button');
    var taSourceCode = $('#taSourceCode');
    var output = $('#output');
    var programTable = $('#program-table');
    var logFilter = $('#log-filter');
    var clearLogButton = $('#clear-log-button');

    // Instantiate a new instance of our logger class by passing in
    // the div that we want to use
    LOGGER = new Combobiler.Logger(output);

    compileButton.on('click', function (e) {
        e.preventDefault();
        LOGGER.info('Compilation started');
        var lexer = new Combobiler.Lexer(taSourceCode.val());
        lexer.performLexicalAnalysis();
    });

    programTable.on('click', '.user-program', function (e) {
        e.preventDefault();

        var button = $(this);
        taSourceCode.val(button.data('program'));
    });

    logFilter.on('change', function (e) {
        e.preventDefault();
        var dropdown = $(this);
        var selectedValue = dropdown.val();
        var logEntries = output.find('.log-row');
        $.each(logEntries, function (i, val) {
            var thisRow = $(val);
            thisRow.show();
            if (selectedValue !== '-' && thisRow.data('type') !== selectedValue) {
                thisRow.hide();
            }
        });
    });

    clearLogButton.on('click', function (e) {
        e.preventDefault();
        output.empty();
    });
});
