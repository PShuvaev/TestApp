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
    var form = $("#add-or-edit-employee-form");
    var table = $("#employee-list-table");

    function clearForm() {
        form[0].reset();
        form.find("input[name=Id]").val("0");
    }
    function clearErrorMessages() {
        form.find(".error").remove();
    }
    function addErrorMessage(field, message) {
        form.find("input[name=" + field + "]")
            .after('<span class="error">' + message + '</span>');
    }

    function showInfoMessage(message, color) {
        $("#error-line").html(message).css("background", color);
    }

    //TODO заменить конкатенацию на handlebars-шаблоны
    function getEmployeeTemplate(employee) {
        return '<tr data-employee-id="' + employee.Id + '">' +
            '<td data-field="LastName">' + employee.LastName + '</td>' +
            '<td data-field="FirstName">' + employee.FirstName + '</td>' +
            '<td data-field="MiddleName">' + employee.MiddleName + '</td>' +
            '<td>' +
                '----' +
            '</td>' +
            '<td>' +
                '40' +
            '</td>' +
            '<td data-field="Email">' +
                '<a href="mailto:' + employee.Email + '">' + employee.Email + '</a>' +
            '</td>' +
            '<td>' +
                '<span class="remove-employee-link action-link">Удалить</span>' +
                '/ ' +
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
                showInfoMessage("Запись добавлена", "lightgreen");
            } else {
                updateEmployeeInTable(employee);
                showInfoMessage("Запись сохранена", "lightgreen");
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
                showInfoMessage("Ошибка", "lightcoral");
            } else {
                tr.remove();
                //очистка формы, если в ней находится удаляемая запись
                if (id == form.find("input[name=Id]").val()) clearForm();
                showInfoMessage("Запись удалена", "lightgreen");
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
        var fields = ['Id', 'LastName', 'FirstName', 'MiddleName', 'Email'];
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            form.find("input[name=" + field + "]").val(employee[field]);
        }
    }

    //TODO: хранить данные в js-объектах, отрисовывать таблицу на клиенте
    /* Собирает данные со строки таблицы, возвращает json-объект */
    function getEmployeeData(tr) {
        var fields = ['LastName', 'FirstName', 'MiddleName', 'Email'];
        var obj = {
            Id: parseInt(tr.attr("data-employee-id"))
        };
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            obj[field] = tr.find("td[data-field=" + field + "]").text().trim();
        }
        return obj;
    }


    /* Добавляет к форме редактирования кнопку отмены редактирования */
    $("input[type=reset]").click(function () {
        clearForm();
    });

});