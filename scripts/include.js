$(document).ready(function () {
    var compileButton = $('#compile-button');
    var taSourceCode = $('#taSourceCode');
    var taOutput = $('#taOutput');

    // Instantiate a new instance of our logger class by passing in
    // the textarea that we want to use
    var logger = new Combobiler.Logger(taOutput);

    compileButton.on('click', function (e) {
        e.preventDefault();
        logger.info('Hi!');
    });
});
