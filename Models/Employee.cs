using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using TestApp.Utils;

namespace TestApp.Models
{
    public class Employee
    {
        public virtual int Id { get; set; }

        [Required(ErrorMessage = "Поле должно быть заполнено")]
        [StringLength(50, MinimumLength = 1, ErrorMessage = "Максимальная длина имени - 50 символов")]
        public virtual string FirstName { get; set; }

        [StringLength(50, MinimumLength = 0, ErrorMessage = "Максимальная длина имени - 50 символов")]
        public virtual string MiddleName { get; set; }

        [Required(ErrorMessage = "Поле должно быть заполнено")]
        [StringLength(50, MinimumLength = 1, ErrorMessage = "Максимальная длина имени - 50 символов")]
        public virtual string LastName { get; set; }

        [Required(ErrorMessage = "Поле должно быть заполнено")]
        [RegularExpression("^[a-zA-Z0-9_\\.-]+@([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$", 
            ErrorMessage = "Неверный формат адреса")]
        public virtual string Email { get; set; }

        [Required(ErrorMessage = "Поле должно быть заполнено")]
        public virtual int Salary { get; set; }
    }
}