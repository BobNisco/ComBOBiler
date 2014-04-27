///<reference path="jquery.d.ts" />
///<reference path="logger.ts" />
///<reference path="runner.ts" />
///<reference path="test_program.ts" />
// Some global variables that will be initialized once the page is fully loaded
var LOGGER = null;

$(document).ready(function () {
    var compileButton = $('#compile-button'), taSourceCode = $('#taSourceCode'), taOutput = $('#taOutput'), logOutput = $('#logOutput'), programTables = $('.program-table'), logFilterType = $('#log-filter-type'), logFilterStatus = $('#log-filter-status'), clearLogButton = $('#clear-log-button'), logPersonality = $('#log-personality'), passTable = $('#pass-table'), warningTable = $('#warning-table'), failTable = $('#fail-table');

    // Instantiate a new instance of our logger class by passing in
    // the div that we want to use and the personality selector
    LOGGER = new Combobiler.Logger(logOutput, logPersonality);

    compileButton.on('click', function (e) {
        e.preventDefault();
        LOGGER.info({
            standard: 'Compilation started',
            sarcastic: 'Compilation started'
        });
        Combobiler.Runner.run(taSourceCode.val());
    });

    programTables.on('click', '.user-program', function (e) {
        e.preventDefault();

        var button = $(this);
        taSourceCode.val(button.data('program'));
    });

    logFilterType.on('change', function (e) {
        e.preventDefault();
        var dropdown = $(this), logEntries = logOutput.find('.log-row');
        $.each(logEntries, function (i, val) {
            var thisRow = $(val);
            thisRow.show();
            if (!determineIfRowShouldBeDisplayed(thisRow)) {
                thisRow.hide();
            }
        });
    });

    logFilterStatus.on('change', function (e) {
        e.preventDefault();
        var dropdown = $(this), logEntries = logOutput.find('.label');
        $.each(logEntries, function (i, val) {
            var thisLabel = $(val), thisRow = thisLabel.parent();
            thisRow.show();
            if (!determineIfRowShouldBeDisplayed(thisRow)) {
                thisRow.hide();
            }
        });
    });

    var determineIfRowShouldBeDisplayedForType = function (selectedValue, thisRow) {
        return !(selectedValue !== '-' && thisRow.data('type') !== selectedValue);
    };

    var determineIfRowShouldBeDisplayedForStatus = function (selectedValue, thisLabel) {
        return !(selectedValue !== '-' && !thisLabel.hasClass(selectedValue));
    };

    var determineIfRowShouldBeDisplayed = function (row) {
        var currentFilterType = logFilterType.val(), currentFilterStatus = logFilterStatus.val(), thisLabel = row.find('.label');
        return (determineIfRowShouldBeDisplayedForStatus(currentFilterStatus, thisLabel) && determineIfRowShouldBeDisplayedForType(currentFilterType, row));
    };

    clearLogButton.on('click', function (e) {
        e.preventDefault();
        logOutput.empty();
    });

    var passPrograms = [
        new Combobiler.TestProgram('Non While', '{&#10;    while false {&#10;        print(&quot;a&quot;)&#10;    }&#10;    &#10;    print(&quot;done&quot;)&#10;} $'),
        new Combobiler.TestProgram('Everything 1', '{&#10;    int a&#10;    a = 1&#10;    {&#10;        int a&#10;        a = 2&#10;        print(a)&#10;    }&#10;    &#10;    string b&#10;    b = &quot;alan&quot;&#10;    &#10;    if(a == 1) {&#10;        print(b)&#10;    }&#10;    &#10;    string c&#10;    c = &quot;james&quot;&#10;    b = &quot;blackstone&quot;&#10;    print(b)&#10;} $&#10;'),
        new Combobiler.TestProgram('While/Print/If', '{&#10;    int a&#10;    int b&#10;    int c&#10;    a = 1&#10;    b = 1&#10;    c = 1&#10;    while(a == 1) {&#10;        print(b)&#10;        if(c == 2) {&#10;            a = 2&#10;        }&#10;        if(b == 2) {&#10;            b = 3&#10;            c = 2&#10;        }&#10;        if(b == 1) {&#10;            b = 2&#10;        }&#10;    }&#10;} $'),
        new Combobiler.TestProgram('Complex If Statements', '{&#10;    int a&#10;    a = 6&#10;    if(a == 2 + 4) {&#10;        print(a)&#10;    }&#10;    if(5 + 4 == 7 + 2) {&#10;        print(a)&#10;    }&#10;} $'),
        new Combobiler.TestProgram('Print Statements', '{&#10;    int a&#10;    a = 1+2+3+4+5&#10;    print(a)&#10;    print(7)&#10;    print(7+a)&#10;    print(&quot;&quot;)&#10;    print(&quot;aa&quot;)&#10;    print(&quot;inta&quot;)&#10;    print(1+2+3+4+5)&#10;    print(false)&#10;    print(true)&#10;} $'),
        new Combobiler.TestProgram('Everything 2', '{&#10;    int a&#10;    a = 0&#10;    string z&#10;    z = &quot;bond&quot;&#10;    while (a != 9) {&#10;        if(a != 5) {&#10;            print(&quot;bond&quot;)&#10;        }&#10;        {&#10;            a = 1 + a&#10;            string b&#10;            b = &quot;james bond&quot;&#10;            print(b)&#10;        }&#10;    }&#10;    {}&#10;    boolean c&#10;    c = true&#10;    boolean d&#10;    d = (true == (true == false))&#10;    d = (a == c)&#10;    d = (1 == a)&#10;    d = (1 != 1)&#10;    d = (&quot;string&quot; == 1)&#10;    d = (a != &quot;string&quot;)&#10;    d = (&quot;string&quot; != &quot;string&quot;)&#10;    if (d == true) {&#10;        int c&#10;        c = 1 + 2&#10;        if (c == 1) {&#10;            print(&quot;ugh&quot;)&#10;        }&#10;    }&#10;    while (&quot;string&quot; == a) {&#10;        while (1 == true) {&#10;            a = 1 + 2&#10;        }&#10;    }&#10;} $')
    ], warningPrograms = [
        new Combobiler.TestProgram('Unused Identifier', '{&#10;    int a&#10;} $'),
        new Combobiler.TestProgram('Assignment to var with no value', '{&#10    int a&#10    int b&#10    b = a&#10} $'),
        new Combobiler.TestProgram('Unused Variable', '{&#10    int a&#10    int b&#10    b = 2&#10    print(b)&#10} $'),
        new Combobiler.TestProgram('Redeclaring Var without Using it', '{&#10    int a&#10    {&#10        a = 5&#10        string a&#10    }&#10} $')
    ], failPrograms = [
        new Combobiler.TestProgram('Type Mismatch', '{&#10;    int a&#10;    a = &quot;bob&quot;&#10;} $'),
        new Combobiler.TestProgram('Invalid Type', '{&#10;    float pi&#10;    pi = 3.14&#10;} $'),
        new Combobiler.TestProgram('Invalid Boolean Expression', '{&#10;    while &quot;a&quot; {&#10;        print ( &quot;a&quot; )&#10;    }&#10;    &#10;    print ( &quot;done&quot; )&#10;} $'),
        new Combobiler.TestProgram('Invalid Statement List', '{&#10;    int a&#10;    a == 6&#10;} $'),
        new Combobiler.TestProgram('Undeclared Identifier', '{&#10;    a = 1&#10;} $'),
        new Combobiler.TestProgram('Redeclared Identifier in Same Scope', '{&#10;    int a&#10;    a = 1&#10;    int a&#10;    a = 2&#10;} $'),
        new Combobiler.TestProgram('Undeclared Identifier in Print Statement', '{&#10;    print(a)&#10;} $'),
        new Combobiler.TestProgram('Type Mismatch 2', '{&#10    int a&#10    string b&#10    b = a&#10} $'),
        new Combobiler.TestProgram('Type Mismatch 3', '{&#10    int a&#10    a = 2 + &quot;what&quot;&#10} $'),
        new Combobiler.TestProgram('Access Var Out Of Scope', '{&#10    int a&#10    {&#10        int b&#10        b = 2&#10    }&#10    a = b&#10} $')
    ];

    var addProgramsToTable = function (table, type, programs) {
        var uiClass;
        if (type === 'pass') {
            uiClass = 'btn-info';
        } else if (type === 'warning') {
            uiClass = 'btn-warning';
        } else if (type === 'fail') {
            uiClass = 'btn-danger';
        }

        var tbody = table.find('tbody');

        for (var i = 0; i < programs.length; i++) {
            tbody.append('<tr><td><div class="btn btn-sm user-program ' + uiClass + '" data-program="' + programs[i].program + '">Program ' + (i + 1) + '</div></td><td>' + programs[i].description + '</td></tr>');
        }
    };

    addProgramsToTable(passTable, 'pass', passPrograms);
    addProgramsToTable(warningTable, 'warning', warningPrograms);
    addProgramsToTable(failTable, 'fail', failPrograms);
});
