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
    public class ScheduleDetailsController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private int pageSize = 20;
        Response response = new Response();
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
                    scheduleDetail.Status = 0;
                    db.ScheduleDetails.Add(scheduleDetail);
                    db.SaveChanges();
                    response.status = "SUCCESS";
                    response.objParam1 = scheduleDetail;
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
                    var ScheduleDetailsHolder = db.ScheduleDetails.Find(id);
                    ScheduleDetailsHolder.Status = 2;
                    db.Entry(scheduleDetail).CurrentValues.SetValues(ScheduleDetailsHolder);
                    db.Entry(scheduleDetail).State = EntityState.Modified;
                    db.SaveChanges();
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
    }
}