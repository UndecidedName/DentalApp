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
            var records = db.ScheduleDetails.Where(sd => sd.ScheduleMasterId == masterId).Count();
            if (records  > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.ScheduleDetails
                    .Where(sd => sd.ScheduleMasterId == masterId)
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
            bool validSchedule = false;
            int recordNo = 0;
            int i = 0;
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }

            try
            {
                var scheduledTime = db.ScheduleDetails.Where(sd => sd.ScheduleMasterId == scheduleDetail.ScheduleMasterId).OrderBy(sd => sd.FromTime).ToArray();
                if (scheduledTime.Length == 0)
                    validSchedule = true;
                else if (scheduleDetail.ToTime < scheduledTime[0].FromTime)
                    validSchedule = true;
                else if (scheduleDetail.FromTime > scheduledTime[scheduledTime.Length - 1].ToTime)
                    validSchedule = true;
                else
                {
                    for (i = 0; i < scheduledTime.Length; i++)
                    {
                        if (scheduleDetail.FromTime > scheduledTime[i].ToTime)
                        {
                            if (scheduleDetail.ToTime < scheduledTime[i + 1].FromTime)
                                validSchedule = true;
                        }
                    }
                }

                if (validSchedule)
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
            ScheduleDetail scheduleDetail = db.ScheduleDetails.Find(id);
            if (scheduleDetail == null)
            {
                response.message = "Schedule not found.";
                return Ok(response);
            }
            try
            {
                db.ScheduleDetails.Remove(scheduleDetail);
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

        private bool ScheduleDetailExists(int id)
        {
            return db.ScheduleDetails.Count(e => e.Id == id) > 0;
        }
    }
}