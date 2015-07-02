using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DentalWebApp.Controllers
{
    public class HomeController : Controller
    {
        // GET: /Home/
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Templates(string id)
        {
            switch (id.ToLower())
            {
                case "aboutus":
                    return PartialView("~/Views/Home/Templates/AboutUs.cshtml");
                case "contactus":
                    return PartialView("~/Views/Home/Templates/ContactUs.cshtml");
                case "header":
                    return PartialView("~/Views/Home/Templates/Header.cshtml");
                case "home":
                    return PartialView("~/Views/Home/Templates/Home.cshtml");
                case "ourservices":
                    return PartialView("~/Views/Home/Templates/OurServices.cshtml");
                case "testimonials":
                    return PartialView("~/Views/Home/Templates/Testimonials.cshtml");
                default:
                    throw new Exception("template not known");
            }
        }
    }
}
