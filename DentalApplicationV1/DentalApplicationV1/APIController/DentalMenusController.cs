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
        Response response = new Response();

        // GET: api/DentalMenus
        public IQueryable<DentalMenu> GetDentalMenus()
        {
            return db.DentalMenus;
        }

        // GET: api/DentalMenus?userTypeId=1
        public IHttpActionResult GetDentalMenus(int userTypeId)
        {
            response.status = "FAILURE";
            var dentalMenu = (from dm in db.DentalMenus where dm.UserTypeId == userTypeId select dm);
            if (dentalMenu != null)
            {
                response.status = "SUCCESS";
                response.objParam1 = dentalMenu;
            }
            return Json(response);
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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != dentalMenu.Id)
            {
                return BadRequest();
            }

            db.Entry(dentalMenu).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DentalMenuExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/DentalMenus
        [ResponseType(typeof(DentalMenu))]
        public IHttpActionResult PostDentalMenu(DentalMenu dentalMenu)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.DentalMenus.Add(dentalMenu);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (DentalMenuExists(dentalMenu.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = dentalMenu.Id }, dentalMenu);
        }

        // DELETE: api/DentalMenus/5
        [ResponseType(typeof(DentalMenu))]
        public IHttpActionResult DeleteDentalMenu(int id)
        {
            DentalMenu dentalMenu = db.DentalMenus.Find(id);
            if (dentalMenu == null)
            {
                return NotFound();
            }

            db.DentalMenus.Remove(dentalMenu);
            db.SaveChanges();

            return Ok(dentalMenu);
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