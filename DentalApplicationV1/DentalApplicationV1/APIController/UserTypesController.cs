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
    public class UserTypesController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private int pageSize = 20;
        // GET: api/UserTypes
        public IQueryable<UserType> GetUserTypes()
        {
            return db.UserTypes;
        }

        public IQueryable<UserType> GetUserTypes(int length)
        {
            int fetch;
            var records = db.DentalMenus.Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.UserTypes
                    .OrderBy(m => m.Name).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<UserType> ut = new List<UserType>().AsQueryable();
                return ut;
            }
        }

        public IQueryable<UserType> GetUserTypes(int length, int status)
        {
            int fetch;
            var records = db.UserTypes.Where(dm => dm.Status == status).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.UserTypes
                    .Where(dm => dm.Status == status)
                    .OrderBy(m => m.Name).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<UserType> ut = new List<UserType>().AsQueryable();
                return ut;
            }
        }

        // GET: api/UserTypes/5
        [ResponseType(typeof(UserType))]
        public IHttpActionResult GetUserType(int id)
        {
            UserType userType = db.UserTypes.Find(id);
            if (userType == null)
            {
                return NotFound();
            }

            return Ok(userType);
        }

        // PUT: api/UserTypes/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutUserType(int id, UserType userType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != userType.Id)
            {
                return BadRequest();
            }

            db.Entry(userType).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserTypeExists(id))
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

        // POST: api/UserTypes
        [ResponseType(typeof(UserType))]
        public IHttpActionResult PostUserType(UserType userType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.UserTypes.Add(userType);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = userType.Id }, userType);
        }

        // DELETE: api/UserTypes/5
        [ResponseType(typeof(UserType))]
        public IHttpActionResult DeleteUserType(int id)
        {
            UserType userType = db.UserTypes.Find(id);
            if (userType == null)
            {
                return NotFound();
            }

            db.UserTypes.Remove(userType);
            db.SaveChanges();

            return Ok(userType);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserTypeExists(int id)
        {
            return db.UserTypes.Count(e => e.Id == id) > 0;
        }
    }
}