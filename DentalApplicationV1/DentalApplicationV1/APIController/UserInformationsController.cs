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
    public class UserInformationsController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private int pageSize = 20;
        // GET: api/UserInformations
        public IQueryable<UserInformation> GetUserInformations()
        {
            return db.UserInformations;
        }

        // GET: api/UserInformations?length=0&userType=1
        public IQueryable<UserInformation> GetUserInformations(int length, int userType)
        {
            int fetch;

            //fetch Dentist only
            if (db.UserInformations.Count() > length)
            {
                if ((db.UserInformations.Where(ui => ui.User.UserTypeId == userType).Count() - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = db.UserInformations.Where(ui => ui.User.UserTypeId == userType).Count() - length;

                return db.UserInformations.Where(ui => ui.User.UserTypeId == userType)
                    .OrderBy(di => di.Id).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<UserInformation> di = new List<UserInformation>().AsQueryable();
                return di;
            }
        }

        // GET: api/UserInformations/5
        [ResponseType(typeof(UserInformation))]
        public IHttpActionResult GetUserInformation(int id)
        {
            UserInformation UserInformation = db.UserInformations.Find(id);
            if (UserInformation == null)
            {
                return NotFound();
            }

            return Ok(UserInformation);
        }

        // PUT: api/UserInformations/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutUserInformation(int id, UserInformation UserInformation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != UserInformation.Id)
            {
                return BadRequest();
            }

            db.Entry(UserInformation).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserInformationExists(id))
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

        // POST: api/UserInformations
        [ResponseType(typeof(UserInformation))]
        public IHttpActionResult PostUserInformation(UserInformation UserInformation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.UserInformations.Add(UserInformation);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = UserInformation.Id }, UserInformation);
        }

        // DELETE: api/UserInformations/5
        [ResponseType(typeof(UserInformation))]
        public IHttpActionResult DeleteUserInformation(int id)
        {
            UserInformation UserInformation = db.UserInformations.Find(id);
            if (UserInformation == null)
            {
                return NotFound();
            }

            db.UserInformations.Remove(UserInformation);
            db.SaveChanges();

            return Ok(UserInformation);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserInformationExists(int id)
        {
            return db.UserInformations.Count(e => e.Id == id) > 0;
        }
    }
}