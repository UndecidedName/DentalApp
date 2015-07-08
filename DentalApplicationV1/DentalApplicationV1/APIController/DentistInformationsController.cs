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
    public class DentistInformationsController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private int pageSize = 20;
        // GET: api/DentistInformations
        public IQueryable<DentistInformation> GetDentistInformations()
        {
            return db.DentistInformations;
        }

        public IQueryable<DentistInformation> GetDentistInformations(int length)
        {
            int fetch;
            //IQueryable<ScheduleMaster> sm = new List<ScheduleMaster>().AsQueryable();
            if (db.DentistInformations.Count() > length)
            {
                if ((db.DentistInformations.Count() - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = db.DentistInformations.Count() - length;

                return db.DentistInformations
                    .OrderBy(di => di.Id).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<DentistInformation> di = new List<DentistInformation>().AsQueryable();
                return di;
            }
        }

        // GET: api/DentistInformations/5
        [ResponseType(typeof(DentistInformation))]
        public IHttpActionResult GetDentistInformation(int id)
        {
            DentistInformation dentistInformation = db.DentistInformations.Find(id);
            if (dentistInformation == null)
            {
                return NotFound();
            }

            return Ok(dentistInformation);
        }

        // PUT: api/DentistInformations/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutDentistInformation(int id, DentistInformation dentistInformation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != dentistInformation.Id)
            {
                return BadRequest();
            }

            db.Entry(dentistInformation).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DentistInformationExists(id))
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

        // POST: api/DentistInformations
        [ResponseType(typeof(DentistInformation))]
        public IHttpActionResult PostDentistInformation(DentistInformation dentistInformation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.DentistInformations.Add(dentistInformation);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = dentistInformation.Id }, dentistInformation);
        }

        // DELETE: api/DentistInformations/5
        [ResponseType(typeof(DentistInformation))]
        public IHttpActionResult DeleteDentistInformation(int id)
        {
            DentistInformation dentistInformation = db.DentistInformations.Find(id);
            if (dentistInformation == null)
            {
                return NotFound();
            }

            db.DentistInformations.Remove(dentistInformation);
            db.SaveChanges();

            return Ok(dentistInformation);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool DentistInformationExists(int id)
        {
            return db.DentistInformations.Count(e => e.Id == id) > 0;
        }
    }
}