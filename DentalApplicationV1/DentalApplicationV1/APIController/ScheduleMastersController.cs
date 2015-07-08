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
    public class ScheduleMastersController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private int pageSize = 20;
        Response response = new Response();
        // GET: api/ScheduleMasters
        public IQueryable<ScheduleMaster> GetScheduleMasters()
        {
            return db.ScheduleMasters;
        }

        // GET: api/ScheduleMasters?length=1
        public IQueryable<ScheduleMaster> GetScheduleMasters(int length)
        {
            int fetch;
            //IQueryable<ScheduleMaster> sm = new List<ScheduleMaster>().AsQueryable();
            if (db.ScheduleMasters.Count() > length)
            {
                if ((db.ScheduleMasters.Count() - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = db.ScheduleMasters.Count() - length;

                return db.ScheduleMasters
                    .Include(sm => sm.DentistInformation)
                    .OrderBy(sm => sm.Date).Skip((length)).Take(fetch);
            }
            else{
                IQueryable<ScheduleMaster> sm = new List<ScheduleMaster>().AsQueryable();
                return sm;
            }
        }

        // GET: api/ScheduleMasters/5
        [ResponseType(typeof(ScheduleMaster))]
        public IHttpActionResult GetScheduleMaster(int id)
        {
            ScheduleMaster scheduleMaster = db.ScheduleMasters.Find(id);
            if (scheduleMaster == null)
            {
                return NotFound();
            }

            return Ok(scheduleMaster);
        }

        // PUT: api/ScheduleMasters/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutScheduleMaster(int id, ScheduleMaster scheduleMaster)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }

            if (id != scheduleMaster.Id)
            {
                response.message = "Schedule not found.";
                return Ok(response);
            }

            db.Entry(scheduleMaster).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = scheduleMaster;
            }
            catch (Exception e)
            {
                if (!ScheduleMasterExists(id))
                {
                    response.message = "Schedule not found.";
                    return Ok(response);
                }
                else
                {
                    response.message = e.InnerException.InnerException.Message.ToString();
                }
            }

            return Ok(response);
        }

        // POST: api/ScheduleMasters
        [ResponseType(typeof(ScheduleMaster))]
        public IHttpActionResult PostScheduleMaster(ScheduleMaster scheduleMaster)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }
            try
            {
                var searchFrom = db.ScheduleMasters.Where(sm => sm.Date == scheduleMaster.Date);
                if (searchFrom.Count() == 0) {
                    scheduleMaster.Status = 1;
                    db.ScheduleMasters.Add(scheduleMaster);
                    db.SaveChanges();
                    response.status = "SUCCESS";
                    response.objParam1 = scheduleMaster;
                }
                else
                    response.message = "Created Schedule is conflict to other schedules.";
            }
            catch (Exception e)
            {
                response.message = e.InnerException.InnerException.Message.ToString();
            }

            return Ok(response);
        }

        // DELETE: api/ScheduleMasters/5
        [ResponseType(typeof(ScheduleMaster))]
        public IHttpActionResult DeleteScheduleMaster(int id)
        {
            response.status = "FAILURE";
            ScheduleMaster scheduleMaster = db.ScheduleMasters.Find(id);
            if (scheduleMaster == null)
            {
                response.message = "Schedule not found.";
                return Ok(response);
            }
            try
            {
                db.ScheduleMasters.Remove(scheduleMaster);
                db.SaveChanges();
                response.status = "SUCCESS";
            }
            catch (Exception e) {
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

        private bool ScheduleMasterExists(int id)
        {
            return db.ScheduleMasters.Count(e => e.Id == id) > 0;
        }
    }
}