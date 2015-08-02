using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DentalWebApp.Controllers
{
    public class UserController : Controller
    {
        //
        // GET: /User/

        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Templates(string id)
        {
            
            switch (id.ToLower()) { 
                case "header":
                    return PartialView("~/Views/User/Templates/Header.cshtml");
                case "sidebar":
                    return PartialView("~/Views/User/Templates/SideBar.cshtml");
                case "appointment":
                    return PartialView("~/Views/User/Templates/Appointment.cshtml");
                case "notification":
                    return PartialView("~/Views/User/Templates/Notification.cshtml");
                case "setting":
                    return PartialView("~/Views/User/Templates/Setting.cshtml");
                case "schedule":
                    return PartialView("~/Views/User/Templates/Schedule.cshtml");
                case "appointmentapproval":
                    return PartialView("~/Views/User/Templates/AppointmentApproval.cshtml");
                case "menu":
                    return PartialView("~/Views/User/Templates/Menu.cshtml");
                case "civilstatus":
                    return PartialView("~/Views/User/Templates/CivilStatus.cshtml");
                case "usermenu":
                    return PartialView("~/Views/User/Templates/UserMenu.cshtml");
                case "usertype":
                    return PartialView("~/Views/User/Templates/UserType.cshtml");
                case "treatmenttype":
                    return PartialView("~/Views/User/Templates/TreatmentType.cshtml");
                case "specialappointments":
                    return PartialView("~/Views/User/Templates/SpecialAppointments.cshtml");
                default: throw new Exception("template not known");
                    
            }
        }
    }
}
