using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NHibernate;
using TestApp.Models;
using TestApp.Utils;
using System.Text;

namespace TestApp.Controllers
{
    // TODO: Вынести задачи персистентности в отдельный сервис
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            using (ISession session = HibernateUtil.OpenSession())
            {
                ViewData["employees"] = session.QueryOver<Employee>().List();
            }
            return View("Home");
        }

        public ActionResult AddEmployee([Bind()] Employee employee)
        {
            if (!ModelState.IsValid)
            {
                return Json(new { Result = "fail", Errors = CollectErrors() });
            }

            using (ISession session = HibernateUtil.OpenSession())
            {
                using (var transaction = session.BeginTransaction())
                {
                    session.SaveOrUpdate(employee);
                    transaction.Commit();
                }
                session.Close();
            }
            return Json(new { Result = "ok", Id = employee.Id });
        }

        /**
         * Строит словарь <Поле, ОшибкиВПоле> при добавлении объекта Employee
         */
        private Dictionary<string, string> CollectErrors()
        {
            var errors = new Dictionary<string,string>();
            
            foreach (var pair in ModelState)
            {
                if (pair.Value.Errors.Count == 0) continue;

                //TODO - написать собственный валидатор для полей типа Integer
                //изменение сообщения об ошибке при введении в числовое поле нечисловой строки
                if (pair.Key.Equals("Salary") && !String.IsNullOrWhiteSpace(pair.Value.Value.RawValue.ToString()))
                {
                    pair.Value.Errors.Clear();
                    pair.Value.Errors.Add("Введите целое положительное число");
                }//end


                var messages = pair.Value.Errors
                    .Select(model => model.ErrorMessage)
                    .Aggregate((a, b) => a + ";" + b);
                errors.Add(pair.Key, messages);
            }
            return errors;
        }


        public ActionResult RemoveEmployee()
        {
            string id = Request.Params["Id"];
            try
            {
                using (var session = HibernateUtil.OpenSession())
                {
                    using (var transaction = session.BeginTransaction())
                    {
                        session.Delete(string.Format("from {0} where id = {1}", typeof(Employee), Convert.ToInt32(id)));
                        transaction.Commit();
                    }
                    session.Close();
                }
                return Json(new { Result = "ok" });
            }
            catch (FormatException e)
            {
                return Json(new { Result = "fail" });
            }
        }
    }
}
