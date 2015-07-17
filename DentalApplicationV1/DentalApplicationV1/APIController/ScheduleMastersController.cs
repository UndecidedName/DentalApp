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
using System.Data.SqlClient;
using System.Configuration;

namespace DentalApplicationV1.APIController
{
    public class ScheduleMastersController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private int pageSize = 20;
        private Response response = new Response();
        // GET: api/ScheduleMasters
        public IQueryable<ScheduleMaster> GetScheduleMasters()
        {
            return db.ScheduleMasters;
        }

        // GET: api/ScheduleMasters?length=1
        public IQueryable<ScheduleMaster> GetScheduleMasters(int length)
        {   
            int fetch;
            var records = db.ScheduleMasters.Where(sm => sm.Status != 2).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.ScheduleMasters.Where(sm => sm.Status != 2)
                    .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4)
                    .OrderBy(sm => sm.Date).Skip((length)).Take(fetch);
            }
            else{
                IQueryable<ScheduleMaster> sm = new List<ScheduleMaster>().AsQueryable();
                return sm;
            }
        }

        // GET: api/ScheduleMasters?length=1&status=0
        public IQueryable<ScheduleMaster> GetScheduleMasters(int length, int status)
        {
            int fetch;
            var records = db.ScheduleMasters.Where(sm => sm.Status == status).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.ScheduleMasters.Where(sm => sm.Status == status)
                    .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4)
                    .OrderBy(sm => sm.Date).Skip((length)).Take(fetch);
            }
            else
            {
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
                if(validateForSave(scheduleMaster.Date, scheduleMaster.DentistId)){
                    saveScheduleMaster(scheduleMaster, "dummy");
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
                if (validateForInactive(id))
                {
                    inactivateScheduleMaster(id);
                    response.status = "SUCCESS";
                }
                else
                    response.message = "Schedule is already used.";
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
        private bool validateForInactive(int id){ 
            var scheduleMasterDetailEdited = db.ScheduleDetails.Where(sde => sde.ScheduleMasterId == id).ToArray();
            for (var i = 0; i < scheduleMasterDetailEdited.Length; i++)
            { 
                //Check if there are schedule that is used
                if (scheduleMasterDetailEdited[i].Status == 1)
                    return false;
            }
            return true;
        }
        private bool validateForSave(DateTime date, int dentisId)
        {
            var searchDate = db.ScheduleMasters.Where(sm => sm.Date == date && sm.DentistId == dentisId && sm.Status != 2);
            if (searchDate.Count() == 0)
                return true;
            else
                return false;
        }
        private bool ScheduleMasterExists(int id)
        {
            return db.ScheduleMasters.Count(e => e.Id == id) > 0;
        }
        public void inactivateScheduleMaster(int id)
        {
            ScheduleMaster scheduleMaster = db.ScheduleMasters.Find(id);
            var scheduleMasterEdited = db.ScheduleMasters.Find(id);
            //Set status to 2 for inactive
            scheduleMasterEdited.Status = 2;
            db.Entry(scheduleMaster).CurrentValues.SetValues(scheduleMasterEdited);
            db.Entry(scheduleMaster).State = EntityState.Modified;
            db.SaveChanges();
        }
        public void updateScheduleMasterStatus(int id, ref int status)
        {
            //get all schedule details that are not cancelled
            var countScheduleDetail = db.ScheduleDetails.Where(sd => sd.ScheduleMasterId == id && sd.Status != 2).ToArray();
            //get all closed schedule details
            var scheduleDetail = db.ScheduleDetails.Where(sd => sd.ScheduleMasterId == id && sd.Status == 1).ToArray();
            ScheduleMaster scheduleMaster = db.ScheduleMasters.Find(id);
            ScheduleMaster scheduleMasterEdited = db.ScheduleMasters.Find(id);
            if (scheduleDetail.Length == countScheduleDetail.Length)
                scheduleMasterEdited.Status = 1;
            else
                scheduleMasterEdited.Status = 0;
            db.Entry(scheduleMaster).CurrentValues.SetValues(scheduleMasterEdited);
            db.Entry(scheduleMaster).State = EntityState.Modified;
            db.SaveChanges();
            status = (int)scheduleMaster.Status;
        }
        public void saveScheduleMaster(ScheduleMaster scheduleMaster, string dummy)
        {
            db.ScheduleMasters.Add(scheduleMaster);
            db.SaveChanges();
        }
    }
}