﻿using System;
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
                default: throw new Exception("template not known");
            }
        }
    }
}