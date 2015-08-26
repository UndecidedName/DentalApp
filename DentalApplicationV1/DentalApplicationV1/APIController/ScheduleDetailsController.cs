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
    public class ScheduleDetailsController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private ScheduleMastersController ScheduleMaster = new ScheduleMastersController();
        private int pageSize = 20;
        private Response response = new Response();
        // GET: api/ScheduleDetails
        public IQueryable<ScheduleDetail> GetScheduleDetails()
        {
            return db.ScheduleDetails;
        }
        // GET: api/ScheduleDetails?length=0&masterId=1
        public IQueryable<ScheduleDetail> GetScheduleDetails(int length, int masterId)
        {
            int fetch;
            var records = db.ScheduleDetails.Where(sd => sd.ScheduleMasterId == masterId)
                                            .Where(sd => sd.Status != 2).Count();
            if (records  > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.ScheduleDetails
                    .Where(sd => sd.ScheduleMasterId == masterId)
                    .Where(sd => sd.Status != 2)
                    .OrderBy(sd => sd.FromTime).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<ScheduleDetail> sd = new List<ScheduleDetail>().AsQueryable();
                return sd;
            }
        }

        // GET: api/ScheduleDetails?length=0&masterId=1&status=0
        public IQueryable<ScheduleDetail> GetScheduleDetails(int length, int masterId, int status)
        {
            int fetch;
            var records = db.ScheduleDetails.Where(sd => sd.ScheduleMasterId == masterId)
                                            .Where(sd => sd.Status == status).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.ScheduleDetails
                    .Where(sd => sd.ScheduleMasterId == masterId)
                    .Where(sd => sd.Status == status)
                    .OrderBy(sd => sd.FromTime).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<ScheduleDetail> sd = new List<ScheduleDetail>().AsQueryable();
                return sd;
            }
        }

        public IHttpActionResult GetScheduleDetails(int length, int masterId, int status, string property, string value, string value2)
        {
            ScheduleDetail[] scheduleDetail = new ScheduleDetail[pageSize];
            this.filterRecord(length, masterId, status, property, value, value2, ref scheduleDetail);
            if (scheduleDetail != null)
                return Ok(scheduleDetail);
            else
                return Ok();

        }

        // GET: api/ScheduleDetails/5
        [ResponseType(typeof(ScheduleDetail))]
        public IHttpActionResult GetScheduleDetail(int id)
        {
            ScheduleDetail scheduleDetail = db.ScheduleDetails.Find(id);
            if (scheduleDetail == null)
            {
                return NotFound();
            }

            return Ok(scheduleDetail);
        }

        // PUT: api/ScheduleDetails/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutScheduleDetail(int id, ScheduleDetail scheduleDetail)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != scheduleDetail.Id)
            {
                return BadRequest();
            }

            db.Entry(scheduleDetail).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ScheduleDetailExists(id))
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

        // POST: api/ScheduleDetails
        [ResponseType(typeof(ScheduleDetail))]
        public IHttpActionResult PostScheduleDetail(ScheduleDetail scheduleDetail)
        {
            int scheduleMasterStatus = 0;
            response.status = "FAILURE";
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }

            try
            {
                if (validateForSave(scheduleDetail.ScheduleMasterId, scheduleDetail.FromTime, scheduleDetail.ToTime))
                {
                    //save scheduleDetail
                    saveScheduleDetail(scheduleDetail, "dummy");
                    //Update schedule master if closed/open
                    ScheduleMaster.updateScheduleMasterStatus(scheduleDetail.ScheduleMasterId, ref scheduleMasterStatus);
                    ScheduleMaster scheduleMaster = db.ScheduleMasters.Find(scheduleDetail.ScheduleMasterId);
                    response.status = "SUCCESS";
                    response.objParam1 = scheduleDetail;
                    response.intParam1 = scheduleMasterStatus;
                }
                else
                    response.message = "Time scheduled is conflict to other schedule.";

            }
            catch (Exception e)
            {
                response.message = e.InnerException.InnerException.Message.ToString();
            }

            return Ok(response);
        }

        // DELETE: api/ScheduleDetails/5
        [ResponseType(typeof(ScheduleDetail))]
        public IHttpActionResult DeleteScheduleDetail(int id)
        {
            int scheduleMasterStatus = 0;
            response.status = "FAILURE";
            var scheduleDetail = db.ScheduleDetails.Find(id);
            if (scheduleDetail == null)
            {
                response.message = "Schedule not found.";
                return Ok(response);
            }
            try
            {
                if (validateForInactive(scheduleDetail.Status))
                {
                    //update schedule detail status to 2 for cancel
                    updateScheduleDetailStatus(id, 2);
                    //Update schedule master if closed/open
                    ScheduleMaster.updateScheduleMasterStatus(scheduleDetail.ScheduleMasterId, ref scheduleMasterStatus);
                    response.intParam1 = scheduleMasterStatus;
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
        
        public bool validateForInactive(int status)
        {
            if (status == 0)
                return true;
            else
                return false;
        }
        public bool validateForSave(int id, TimeSpan fromTime, TimeSpan toTime)
        {
            var scheduledTime = db.ScheduleDetails.Where(sd => sd.ScheduleMasterId == id && sd.Status != 2).OrderBy(sd => sd.FromTime).ToArray();
            if (scheduledTime.Length == 0)
                return true;
            else if (toTime < scheduledTime[0].FromTime)
                return true;
            else if (fromTime > scheduledTime[scheduledTime.Length - 1].ToTime)
                return true;
            else
            {
                for (int i = 0; i < scheduledTime.Length; i++)
                {
                    if (fromTime > scheduledTime[i].ToTime)
                    {
                        if (toTime < scheduledTime[i + 1].FromTime)
                            return true;
                    }
                }
            }
            return false;
        }
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
        private bool ScheduleDetailExists(int id)
        {
            return db.ScheduleDetails.Count(e => e.Id == id) > 0;
        }
        public void saveScheduleDetail(ScheduleDetail scheduleDetail, string dummy)
        {
            db.ScheduleDetails.Add(scheduleDetail);
            db.SaveChanges();
        }
        public void updateScheduleDetailStatus(int id, int status) {
            var scheduleDetail = db.ScheduleDetails.Find(id);
            var ScheduleDetailsHolder = db.ScheduleDetails.Find(id);
            ScheduleDetailsHolder.Status = status;
            db.Entry(scheduleDetail).CurrentValues.SetValues(ScheduleDetailsHolder);
            db.Entry(scheduleDetail).State = EntityState.Modified;
            db.SaveChanges();
        }
        public void filterRecord(int length, int masterId, int status, string property, string value, string value2, ref ScheduleDetail[] scheduleDetail)
        {
            int fetch;
            scheduleDetail = null;
            if (property.Equals("FromTime"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Time");
                var records = db.ScheduleDetails.Where(a => a.FromTime >= strManipulate.timeValue && a.FromTime <= strManipulate.timeValue2)
                                                .Where(a => a.ScheduleMasterId == masterId)
                                                .Where(a => a.Status == status).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getScheduleDetail = db.ScheduleDetails
                        .Where(a => a.FromTime >= strManipulate.timeValue && a.FromTime <= strManipulate.timeValue2)
                        .Where(a => a.ScheduleMasterId == masterId)
                        .Where(a => a.Status == status)
                        .OrderByDescending(a => a.FromTime).Skip((length)).Take(fetch).ToArray();
                    scheduleDetail = getScheduleDetail;
                }
            }
            //ToTime
            else
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Time");
                var records = db.ScheduleDetails.Where(a => a.ToTime >= strManipulate.timeValue && a.ToTime <= strManipulate.timeValue2)
                                                .Where(a => a.ScheduleMasterId == masterId)
                                                .Where(a => a.Status == status).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getScheduleDetail = db.ScheduleDetails
                        .Where(a => a.ToTime >= strManipulate.timeValue && a.ToTime <= strManipulate.timeValue2)
                        .Where(a => a.ScheduleMasterId == masterId)
                        .Where(a => a.Status == status)
                        .OrderByDescending(a => a.FromTime).Skip((length)).Take(fetch).ToArray();
                    scheduleDetail = getScheduleDetail;
                }
            }
        }
    }
}