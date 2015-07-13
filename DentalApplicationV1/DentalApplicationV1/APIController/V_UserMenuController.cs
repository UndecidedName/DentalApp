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

namespace DentalApplicationV1.APIController
{
    public class V_UserMenuController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();

        // GET: api/V_UserMenu
        public IQueryable<V_UserMenu> GetV_UserMenu()
        {
            return db.V_UserMenu;
        }

        public IQueryable<V_UserMenu> GetV_UserMenu(int userTypeId)
        {
            return db.V_UserMenu.Where(vum => vum.UserTypeId == userTypeId);
        }

        // GET: api/V_UserMenu/5
        [ResponseType(typeof(V_UserMenu))]
        public IHttpActionResult GetV_UserMenu(string id)
        {
            V_UserMenu v_UserMenu = db.V_UserMenu.Find(id);
            if (v_UserMenu == null)
            {
                return NotFound();
            }

            return Ok(v_UserMenu);
        }

        // PUT: api/V_UserMenu/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutV_UserMenu(string id, V_UserMenu v_UserMenu)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != v_UserMenu.Name)
            {
                return BadRequest();
            }

            db.Entry(v_UserMenu).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!V_UserMenuExists(id))
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

        // POST: api/V_UserMenu
        [ResponseType(typeof(V_UserMenu))]
        public IHttpActionResult PostV_UserMenu(V_UserMenu v_UserMenu)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.V_UserMenu.Add(v_UserMenu);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (V_UserMenuExists(v_UserMenu.Name))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = v_UserMenu.Name }, v_UserMenu);
        }

        // DELETE: api/V_UserMenu/5
        [ResponseType(typeof(V_UserMenu))]
        public IHttpActionResult DeleteV_UserMenu(string id)
        {
            V_UserMenu v_UserMenu = db.V_UserMenu.Find(id);
            if (v_UserMenu == null)
            {
                return NotFound();
            }

            db.V_UserMenu.Remove(v_UserMenu);
            db.SaveChanges();

            return Ok(v_UserMenu);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool V_UserMenuExists(string id)
        {
            return db.V_UserMenu.Count(e => e.Name == id) > 0;
        }
    }
}