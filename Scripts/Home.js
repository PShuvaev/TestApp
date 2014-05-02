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
    }
    function clearErrorMessages() {
        form.find(".error").remove();
    }
    function addErrorMessage(field, message) {
        form.find("input[name=" + field + "]")
            .after('<span class="error">' + message + '</span>');
    }

    function showInfoMessage(message) {
        var elem = '<span class="info">' + message + '</span>';
        form.find("input[type=submit]").after(elem);
    }

    //TODO заменить конкатенацию на handlebars-шаблоны
    function getEmployerTemplate(employee) {
        alert(JSON.stringify(employee));
        return '<tr data-employee-id="' + employee.Id + '>' +
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

    function addEmployerToTable(employee) {
        var tpl = getEmployerTemplate(employee);
        table.append(tpl);
    }

    function saveEmployer(employer) {
        $.post("/Home/AddEmployer", employer, function (data) {
            if (data.Result != "ok") {
                var errors = data.Errors;
                for (var field in errors) {
                    addErrorMessage(field, errors[field]);
                }
                return;
            }

            employer.Id = data.Id;
            addEmployerToTable(employer);
            clearForm();
            showInfoMessage("Запись добавлена");
        });
    }



    /* Скрытие/показ формы добавления/редактирования данных сотрудника */
    var addEmployeeLink = $("#add-employee-link").toggle(function () {
        form.css("display", "inherit");
        addEmployeeLink.html("Скрыть форму");
    }, function () {
        form.css("display", "none");
        addEmployeeLink.html("Добавить сотрудника");
    });



    /* Добавления сотрудника */
    form.find("input[type=submit]").click(function () {
        var employer = serializeFormToObject(form);
        clearErrorMessages();
        saveEmployer(employer);
        return false;
    });


    /* Удаление сотрудника */
    table.on('click', '.remove-employee-link', function () {
        var tr = $(this).closest("tr");
        var id = parseInt(tr.attr("data-employee-id"));

        $.post("/Home/RemoveEmployee", { Id: id }, function (data) {
            if (data.Result != "ok") {
                showInfoMessage("Ошибка");
                return;
            }
            tr.remove();
            showInfoMessage("Запись удалена");
        });
    });



    /* Редактирование данных сотрудника */
    table.on('click', '.edit-employee-link', function () {
        var tr = $(this).closest("tr");
        fillEmployeeForm(getEmployeeData(tr));
        addEmployeeLink.click();
        addCancelEditButton();
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

    function addCancelEditButton() {
        var cancelBtn = $('<input type="reset" value="Отмена"/>')
            .insertAfter(form.find("input[type=submit]"));
        form.find("input[name=Id]").val("0");
    }

});