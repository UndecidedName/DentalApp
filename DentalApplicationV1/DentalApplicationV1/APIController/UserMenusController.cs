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
        private Response response = new Response();
        private int pageSize = 20;
        // GET: api/UserMenus
        public IQueryable<UserMenu> GetUserMenus()
        {
            return db.UserMenus;
        }

        // GET: api/UserMenus?length=0&userTypeId=1
        public IQueryable<UserMenu> GetUserMenus(int length, int userTypeId)
        {
            int fetch;
            var records = db.UserMenus.Where(um => um.UserTypeId == userTypeId)
                                            .Where(um => um.Status != 0).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.UserMenus
                    .Include(um => um.DentalMenu)
                    .Where(um => um.UserTypeId == userTypeId)
                    .Where(um => um.UserTypeId != 0)
                    .OrderBy(um => um.Id).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<UserMenu> um = new List<UserMenu>().AsQueryable();
                return um;
            }
        }

        // GET: api/UserMenus?length=0&userTypeId=1&status=0
        public IQueryable<UserMenu> GetUserMenus(int length, int userTypeId, int status)
        {
            int fetch;
            var records = db.UserMenus.Where(um => um.UserTypeId == userTypeId)
                                            .Where(um => um.Status == status).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.UserMenus
                    .Include(um => um.DentalMenu)
                    .Where(um => um.UserTypeId == userTypeId)
                    .Where(um => um.Status == status)
                    .OrderBy(um => um.Id).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<UserMenu> um = new List<UserMenu>().AsQueryable();
                return um;
            }
        }

        public IQueryable<UserMenu> GetUserMenus(int userTypeId)
        {
            return db.UserMenus;
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
            response.status = "FAILURE";
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }
            try
            {
                if (!validateMenu(userMenu.UserTypeId, userMenu.MenuId))
                    response.message = "User already have this menu, please choose another menu.";
                else
                {
                    db.UserMenus.Add(userMenu);
                    db.SaveChanges();
                    response.status = "SUCCESS";
                    response.objParam1 = userMenu;
                }
            }
            catch(Exception e){
                response.message = e.InnerException.InnerException.Message.ToString();
            }

            return Ok(response);
        }

        // DELETE: api/UserMenus/5
        [ResponseType(typeof(UserMenu))]
        public IHttpActionResult DeleteUserMenu(int id)
        {
            response.status = "FAILURE";
            UserMenu userMenu = db.UserMenus.Find(id);
            if (userMenu == null)
            {
                response.message = "Menu not found.";
                return Ok(response);
            }
            try
            {
                db.UserMenus.Remove(userMenu);
                db.SaveChanges();
                response.status = "SUCCESS";
            }
            catch (Exception e) {
                response.message = e.InnerException.InnerException.Message.ToString();
            }

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
        private bool validateMenu(int userTypeId, int menuId) {
            var searchMenu = db.UserMenus
                            .Where(um => um.UserTypeId == userTypeId)
                            .Where(um => um.MenuId == menuId).ToArray();
            if (searchMenu.Length > 0)
                return false;
            else
                return true;
        }
    }
}