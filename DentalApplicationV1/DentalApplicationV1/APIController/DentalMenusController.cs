using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using DentalApplicationV1.Models;
using YbanezNacua.Models;

namespace DentalApplicationV1.APIController
{
    public class DentalMenusController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private Response response = new Response();
        private int pageSize = 20;
        // GET: api/DentalMenus
        public IQueryable<DentalMenu> GetDentalMenus()
        {
            return db.DentalMenus;
        }

        public IHttpActionResult GetDentalMenus(int length)
        {
            int fetch;
            var records = db.DentalMenus.Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;
                var getDentalMenus = db.DentalMenus
                    .OrderBy(m => m.Name).Skip((length)).Take(fetch).ToArray();
                for(int i = 0; i < getDentalMenus.Length; i++)
                {
                    getDentalMenus[i].UserMenus = null;
                }
                return Ok(getDentalMenus);
            }
            else
            {
                return Ok();
            }
        }

        public IHttpActionResult GetDentalMenus(int length, int status)
        {
            int fetch;
            var records = db.DentalMenus.Where(dm => dm.Status == status).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;
                var getDentalMenus = db.DentalMenus
                    .Where(dm => dm.Status == status)
                    .OrderBy(m => m.Name).Skip((length)).Take(fetch).ToArray();
                return Ok(getDentalMenus);
            }
            else
            {
                return Ok();
            }
        }

        // GET: api/DentalMenus/5
        [ResponseType(typeof(DentalMenu))]
        public IHttpActionResult GetDentalMenu(int id)
        {
            DentalMenu dentalMenu = db.DentalMenus.Find(id);
            if (dentalMenu == null)
            {
                return NotFound();
            }

            return Ok(dentalMenu);
        }

        //Filtering
        public IHttpActionResult GetDentalMenu(int length, string property, string value, string value2)
        {
            DentalMenu[] dentalMenu = new DentalMenu[pageSize];
            this.filterRecord(length, property, value, value2, ref dentalMenu);
            if (dentalMenu != null)
                return Ok(dentalMenu);
            else
                return Ok();
        }

        // PUT: api/DentalMenus/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutDentalMenu(int id, DentalMenu dentalMenu)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid || id != dentalMenu.Id)
            {
                response.message = "Bad request.";
                return Ok(response);
            }

            db.Entry(dentalMenu).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = dentalMenu;
            }
            catch (Exception e)
            {
                if (!DentalMenuExists(id))
                {
                    response.message = "Menu doesn't exist.";
                }
                else
                {
                    response.message = e.InnerException.InnerException.Message.ToString();
                }
            }

            return Ok(response);
        }

        // POST: api/DentalMenus
        [ResponseType(typeof(DentalMenu))]
        public IHttpActionResult PostDentalMenu(DentalMenu dentalMenu)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }
            try
            {
                db.DentalMenus.Add(dentalMenu);
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = dentalMenu;
            }
            catch (Exception e) {
                response.message = e.InnerException.InnerException.Message.ToString();
            }

            return Ok(response);
        }

        // DELETE: api/DentalMenus/5
        [ResponseType(typeof(DentalMenu))]
        public IHttpActionResult DeleteDentalMenu(int id)
        {
            response.status = "FAILURE";
            DentalMenu dentalMenu = db.DentalMenus.Find(id);
            if (dentalMenu == null)
            {
                response.message = "Menu doesn't exist.";
                return Ok(response);
            }
            try
            {
                db.DentalMenus.Remove(dentalMenu);
                db.SaveChanges();
                response.status = "SUCCESS";
            }
            catch (Exception e)
            {
                response.message = e.InnerException.InnerException.Message.ToString();
            }

            return Ok(response);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool DentalMenuExists(int id)
        {
            return db.DentalMenus.Count(e => e.Id == id) > 0;
        }

        public void filterRecord(int length, string property, string value, string value2, ref DentalMenu[] dentalMenu)
        {
            /* Fields that can be filter
             * Name
             * Desription
             * Status
             */
            //Filter for a specific patient
            int fetch;
            dentalMenu = null;
            if (property.Equals("Name"))
            {
                value = value.ToLower();
                var records = db.DentalMenus.Where(dm => dm.Name.ToLower().Contains(value) || dm.Name.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDentalMenu = db.DentalMenus.Where(dm => dm.Name.ToLower().Contains(value) || dm.Name.ToLower().ToLower().Equals(value))
                        .OrderBy(dm => dm.Id).Skip((length)).Take(fetch).ToArray();
                    dentalMenu = getDentalMenu;
                }
            }
            else if (property.Equals("Description"))
            {
                value = value.ToLower();
                var records = db.DentalMenus.Where(dm => dm.Description.ToLower().Contains(value) || dm.Description.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDentalMenu = db.DentalMenus.Where(dm => dm.Description.ToLower().Contains(value) || dm.Description.ToLower().ToLower().Equals(value))
                        .OrderBy(dm => dm.Id).Skip((length)).Take(fetch).ToArray();
                    dentalMenu = getDentalMenu;
                }
            }
            else if (property.Equals("Url"))
            {
                value = value.ToLower();
                var records = db.DentalMenus.Where(dm => dm.Url.ToLower().Contains(value) || dm.Url.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDentalMenu = db.DentalMenus.Where(dm => dm.Url.ToLower().Contains(value) || dm.Url.ToLower().ToLower().Equals(value))
                        .OrderBy(dm => dm.Id).Skip((length)).Take(fetch).ToArray();
                    dentalMenu = getDentalMenu;
                }
            }
            else if (property.Equals("ParentName"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Integer");
                var records = db.DentalMenus.Where(dm => dm.ParentId == strManipulate.intValue).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDentalMenu = db.DentalMenus.Where(dm => dm.ParentId == strManipulate.intValue)
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    dentalMenu = getDentalMenu;
                }
            }
            //status
            else
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Integer");
                var records = db.DentalMenus.Where(dm => dm.Status == strManipulate.intValue).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDentalMenu = db.DentalMenus.Where(dm => dm.Status == strManipulate.intValue)
                        .OrderBy(dm => dm.Id).Skip((length)).Take(fetch).ToArray();
                    dentalMenu = getDentalMenu;
                }
            }
        }
    }
}