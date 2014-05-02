using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using NHibernate;
using NHibernate.Cfg;
using TestApp.Models;
using NHibernate.Tool.hbm2ddl;

namespace TestApp.Utils
{
    public class HibernateUtil
    {
        private static string pathToConfig = HttpContext.Current.Server.MapPath(@"~\Models\nhibernate-config\");
        private static ISessionFactory SessionFactory;

        private static Type[] EntityList = { typeof(Employee) };

        public static void Init()
        {
            var configuration = new Configuration();
            var configurationPath = pathToConfig + "hibernate.cfg.xml";
            configuration.Configure(configurationPath);

            foreach (Type entity in EntityList)
            {
                var cfgFile = pathToConfig + entity.Name + ".hbm.xml";
                configuration.AddFile(cfgFile);
            }
            new SchemaExport(configuration).Execute(true, true, false);

            SessionFactory = configuration.BuildSessionFactory();
            FillTestDb();
        }

        private static void FillTestDb()
        {
            using (ISession session = OpenSession())
            {
                new List<Employee>
                {
                    new Employee{FirstName = "Александр", MiddleName = "Иванович", LastName = "Брет", Email = "bret@gmail.com", Salary = 32000},
                    new Employee{FirstName = "Сергей", MiddleName = "Александрович", LastName = "Корнеев", Email = "serg@yandex.ru", Salary = 114000},
                    new Employee{FirstName = "Елена", MiddleName = "Борисовна", LastName = "Никитина", Email = "elena25@mail.ru", Salary = 57000}
                }.ForEach(e => session.Save(e));
            }
        }


        public static ISession OpenSession()
        {
            if(SessionFactory == null) throw new Exception("SessionFactory is not initialized");
            return SessionFactory.OpenSession();
        }
    }
}