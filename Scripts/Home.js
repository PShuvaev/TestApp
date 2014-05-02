/* Сериализует данные формы в json-объект */
function serializeFormToObject($form) {
    var array = $form.serializeArray();
    var obj = {};
    for (var i = 0; i < array.length; i++) {
        var pair = array[i];
        obj[pair.name] = pair.value;
    }
    return obj;
}

$(function () {
    var employeeFields = ['LastName', 'FirstName', 'MiddleName', 'Email', 'Salary'];
    var INFO_COLOR = "lightgreen", ERROR_COLOR = "lightcoral";

    var form = $("#add-or-edit-employee-form");
    var table = $("#employee-list-table");

    function clearForm() {
        form[0].reset();
        form.find("input[name=Id]").val("0");
    }
    function clearErrorMessages() {
        form.find(".error").remove();
        showInfoMessage("", "white");
    }
    function addErrorMessage(field, message) {
        form.find("input[name=" + field + "]")
            .after('<span class="error">' + message + '</span>');
    }

    function showInfoMessage(message, color) {
        $("#error-line").html(message).css("background", color);
    }

    //TODO заменить конкатенацию строк на handlebars-шаблоны
    function getEmployeeTemplate(employee) {
        function mkTd(fieldName) {
            var innerHtml = employee[fieldName];
            if (fieldName == 'Email') innerHtml = '<a href="mailto:' + employee.Email + '">' + employee.Email + '</a>';
            return '<td data-field="' + fieldName + '">' + innerHtml + '</td>';
        }
        return '<tr data-employee-id="' + employee.Id + '">' + employeeFields.map(mkTd).join(' ') +
            '<td>' +
                '<span class="remove-employee-link action-link">Удалить</span> / ' +
                '<span class="edit-employee-link action-link">Редактировать</span>' +
            '</td>' +
        '</tr>';
    }

    function addEmployeeToTable(employee) {
        var tpl = getEmployeeTemplate(employee);
        table.append(tpl);
    }

    function updateEmployeeInTable(employee) {
        var tpl = getEmployeeTemplate(employee);
        table.find('tr[data-employee-id=' + employee.Id + ']')
            .replaceWith(tpl);
    }

    function saveEmployee(employee, onSuccessCallback) {
        $.post("/Home/AddEmployee", employee, function (data) {
            if (data.Result != "ok") {
                var errors = data.Errors;
                for (var field in errors) {
                    addErrorMessage(field, errors[field]);
                }
                showInfoMessage("Проверьте форму на наличие ошибок", ERROR_COLOR);
            } else {
                employee.Id = data.Id;
                onSuccessCallback();
            }
        });
    }



    /* Скрытие/показ формы добавления/редактирования данных сотрудника */
    var addEmployeeLink = $("#add-employee-link").click(function () {
        if (form.css("display") == "none") {
            form.css("display", "inherit");
            addEmployeeLink.html("Скрыть форму");
        } else {
            form.css("display", "none");
            addEmployeeLink.html("Добавить сотрудника");
        }
    });



    /* Добавления сотрудника */
    form.find("input[type=submit]").click(function () {
        var employee = serializeFormToObject(form);
        clearErrorMessages();
        saveEmployee(employee, function () {
            if (form.find("input[name=Id]").val() == "0") {
                addEmployeeToTable(employee);
                clearForm();
                showInfoMessage("Запись добавлена", INFO_COLOR);
            } else {
                updateEmployeeInTable(employee);
                showInfoMessage("Запись сохранена", INFO_COLOR);
            }
        });
        return false;
    });


    /* Удаление сотрудника */
    table.on('click', '.remove-employee-link', function () {
        if (!confirm('Удалить данные сотрудника?')) return;

        var tr = $(this).closest("tr");
        var id = tr.attr("data-employee-id");

        $.post("/Home/RemoveEmployee", { Id: parseInt(id) }, function (data) {
            if (data.Result != "ok") {
                showInfoMessage("Непредвиденная ошибка", ERROR_COLOR);
            } else {
                tr.remove();
                //очистка формы, если в ней находится удаляемая запись
                if (id == form.find("input[name=Id]").val()) clearForm();
                showInfoMessage("Запись удалена", INFO_COLOR);
            }
        });
    });



    /* Редактирование данных сотрудника */
    table.on('click', '.edit-employee-link', function () {
        var tr = $(this).closest("tr");

        form.css("display", "inherit");
        addEmployeeLink.html("Скрыть форму");

        fillEmployeeForm(getEmployeeData(tr));
    });

    /* Заполняет форму данными из переданного json-объекта */
    function fillEmployeeForm(employee) {
        var fields = ['Id'].concat(employeeFields);
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            form.find("input[name=" + field + "]").val(employee[field]);
        }
    }

    //TODO: хранить данные в js-объектах, отрисовывать таблицу на клиенте
    /* Собирает данные со строки таблицы, возвращает json-объект */
    function getEmployeeData(tr) {
        var obj = {
            Id: parseInt(tr.attr("data-employee-id"))
        };
        for (var i = 0; i < employeeFields.length; i++) {
            var field = employeeFields[i];
            obj[field] = tr.find("td[data-field=" + field + "]").text().trim();
        }
        return obj;
    }


    /* Добавляет к форме редактирования кнопку отмены редактирования */
    $("input[type=reset]").click(function () {
        clearForm();
    });

});