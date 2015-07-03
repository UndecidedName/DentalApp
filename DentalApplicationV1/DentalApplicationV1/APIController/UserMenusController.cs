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
    public class UserMenusController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        Response response = new Response();
        // GET: api/UserMenus
        public IQueryable<UserMenu> GetUserMenus()
        {
            return db.UserMenus;
        }

        // GET: api/UserMenus?userTypeId=1
        public IHttpActionResult GetUserMenus(int userTypeId)
        {
            response.status = "FAILURE";
            var userMenu = (from um in db.UserMenus where um.UserTypeId == userTypeId select um);
            if (userMenu != null)
            {
                response.status = "SUCCESS";
                response.objParam1 = userMenu;
            }
            return Json(response);
        }
        // GET: api/UserMenus/5
        [ResponseType(typeof(UserMenu))]
        public IHttpActionResult GetUserMenu(int id)
        {
            UserMenu userMenu = db.UserMenus.Find(id);
            if (userMenu == null)
            {
                return NotFound();
            }

            return Ok(userMenu);
        }

        // PUT: api/UserMenus/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutUserMenu(int id, UserMenu userMenu)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != userMenu.Id)
            {
                return BadRequest();
            }

            db.Entry(userMenu).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserMenuExists(id))
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

        // POST: api/UserMenus
        [ResponseType(typeof(UserMenu))]
        public IHttpActionResult PostUserMenu(UserMenu userMenu)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.UserMenus.Add(userMenu);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = userMenu.Id }, userMenu);
        }

        // DELETE: api/UserMenus/5
        [ResponseType(typeof(UserMenu))]
        public IHttpActionResult DeleteUserMenu(int id)
        {
            UserMenu userMenu = db.UserMenus.Find(id);
            if (userMenu == null)
            {
                return NotFound();
            }

            db.UserMenus.Remove(userMenu);
            db.SaveChanges();

            return Ok(userMenu);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserMenuExists(int id)
        {
            return db.UserMenus.Count(e => e.Id == id) > 0;
        }
    }
}