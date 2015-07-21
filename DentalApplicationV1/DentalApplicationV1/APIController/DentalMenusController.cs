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

        public IQueryable<DentalMenu> GetDentalMenus(int length)
        {
            int fetch;
            var records = db.DentalMenus.Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.DentalMenus
                    .OrderBy(m => m.Name).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<DentalMenu> m = new List<DentalMenu>().AsQueryable();
                return m;
            }
        }

        public IQueryable<DentalMenu> GetDentalMenus(int length, int status)
        {
            int fetch;
            var records = db.DentalMenus.Where(dm => dm.Status == status).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.DentalMenus
                    .Where(dm => dm.Status == status)
                    .OrderBy(m => m.Name).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<DentalMenu> m = new List<DentalMenu>().AsQueryable();
                return m;
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
    }
}