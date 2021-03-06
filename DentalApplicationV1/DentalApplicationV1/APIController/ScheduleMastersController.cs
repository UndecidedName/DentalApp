﻿using System;
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
        public IHttpActionResult GetScheduleMasters(int length)
        {   
            int fetch;
            var records = db.ScheduleMasters.Where(sm => sm.Status != 2).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;
                var getScheduleMasters = db.ScheduleMasters.Where(sm => sm.Status != 2)
                    .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4)
                    .OrderBy(sm => sm.Date).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                return Ok(getScheduleMasters);
            }
            else
            {
                return Ok();
            }
        }

        // GET: api/ScheduleMasters?length=1&status=0
        public IHttpActionResult GetScheduleMasters(int length, int status)
        {
            int fetch;
            var records = db.ScheduleMasters.Where(sm => sm.Status == status).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;
                    var getScheduleMasters =  db.ScheduleMasters.Where(sm => sm.Status == status)
                    .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4)
                    .OrderBy(sm => sm.Date).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                return Ok(getScheduleMasters);
            }
            else
            {
                return Ok();
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

        //Filtering for Schedule date, regardless of the status
        public IHttpActionResult GetScheduleMaster(int length, string property, string value, string value2)
        {
            ScheduleMaster[] scheduleMaster = new ScheduleMaster[pageSize];
            this.filterRecord(length, property, value, value2, ref scheduleMaster);
            if (scheduleMaster != null)
                return Ok(scheduleMaster);
            else
                return Ok();

        }

        //Filtering for Schedule date, base on the status
        public IHttpActionResult GetScheduleMaster(int length, int status, string property, string value, string value2)
        {
            ScheduleMaster[] scheduleMaster = new ScheduleMaster[pageSize];
            this.filterRecord(length, status, property, value, value2, ref scheduleMaster);
            if (scheduleMaster != null)
                return Ok(scheduleMaster);
            else
                return Ok();

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
                var getScheduleDetail = db.ScheduleDetails.Where(sd => sd.ScheduleMasterId == scheduleMaster.Id).AsNoTracking().ToArray();
                bool valid = true;
                //Check if details are not yet used or still open
                foreach (ScheduleDetail sd in getScheduleDetail)
                {
                    if (sd.Status == 1)
                    {
                        valid = false;
                        break;
                    }
                }
                if (!valid || scheduleMaster.Status == 1)
                {
                    response.message = "Schedule is already used so changing the dentist is not allowed.";
                    return Ok(response);
                }
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
            //ref int status parameter is to get the master status after this function executed

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
        public void filterRecord(int length, string property, string value, string value2, ref ScheduleMaster[] scheduleMaster)
        {
            /* Fields that can be filter
             * Name
             * Desription
             * Status
             */
            //Filter for a specific patient
            int fetch;
            scheduleMaster = null;
            if (property.Equals("Date"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Date");
                strManipulate.dateValue2 = strManipulate.dateValue2.AddHours(11);
                var records = db.ScheduleMasters.Where(sm => sm.Date >= strManipulate.dateValue && sm.Date <= strManipulate.dateValue2).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getScheduleMaster = db.ScheduleMasters.Where(sm => sm.Date >= strManipulate.dateValue && sm.Date <= strManipulate.dateValue2)
                                                              .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4)
                                                              .OrderByDescending(sm => sm.Date).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    scheduleMaster = getScheduleMaster;
                }
            }
            else if (property.Equals("DentistFirstName"))
            {
                value = value.ToLower();
                var records = db.ScheduleMasters.Where(sm => sm.UserInformation.FirstName.ToLower().Contains(value) || sm.UserInformation.FirstName.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getScheduleMaster = db.ScheduleMasters.Where(sm => sm.UserInformation.FirstName.ToLower().Contains(value) || sm.UserInformation.FirstName.ToLower().ToLower().Equals(value))
                                                              .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4)
                                                              .OrderBy(sm => sm.Id).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    scheduleMaster = getScheduleMaster;
                }
            }
            else if (property.Equals("DentistMiddleName"))
            {
                value = value.ToLower();
                var records = db.ScheduleMasters.Where(sm => sm.UserInformation.MiddleName.ToLower().Contains(value) || sm.UserInformation.MiddleName.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getScheduleMaster = db.ScheduleMasters.Where(sm => sm.UserInformation.MiddleName.ToLower().Contains(value) || sm.UserInformation.MiddleName.ToLower().ToLower().Equals(value))
                                                              .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4)
                                                              .OrderBy(sm => sm.Id).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    scheduleMaster = getScheduleMaster;
                }
            }
            else if (property.Equals("DentistLastName"))
            {
                value = value.ToLower();
                var records = db.ScheduleMasters.Where(sm => sm.UserInformation.LastName.ToLower().Contains(value) || sm.UserInformation.LastName.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getScheduleMaster = db.ScheduleMasters.Where(sm => sm.UserInformation.LastName.ToLower().Contains(value) || sm.UserInformation.LastName.ToLower().ToLower().Equals(value))
                                                              .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4)
                                                              .OrderBy(sm => sm.Id).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    scheduleMaster = getScheduleMaster;
                }
            }
            //status
            else
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Integer");
                var records = db.ScheduleMasters.Where(sm => sm.Status == strManipulate.intValue).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getScheduleMaster = db.ScheduleMasters.Where(sm => sm.Status == strManipulate.intValue)
                                                              .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4)
                                                              .OrderBy(sm => sm.Id).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    scheduleMaster = getScheduleMaster;
                }
            }
        }
        public void filterRecord(int length, int status, string property, string value, string value2, ref ScheduleMaster[] scheduleMaster)
        {
            /* Fields that can be filter
             * Name
             * Desription
             * Status
             */
            //Filter for a specific patient
            int fetch;
            scheduleMaster = null;
            if (property.Equals("Date"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Date");
                strManipulate.dateValue2 = strManipulate.dateValue2.AddHours(11);
                var records = db.ScheduleMasters.Where(sm => sm.Date >= strManipulate.dateValue && sm.Date <= strManipulate.dateValue2 && sm.Status == status).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getScheduleMaster = db.ScheduleMasters.Where(sm => sm.Date >= strManipulate.dateValue && sm.Date <= strManipulate.dateValue2 && sm.Status == status)
                                                              .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4)
                                                              .OrderByDescending(sm => sm.Date).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    scheduleMaster = getScheduleMaster;
                }
            }
            else if (property.Equals("DentistFirstName"))
            {
                value = value.ToLower();
                var records = db.ScheduleMasters.Where(sm => (sm.UserInformation.FirstName.ToLower().Contains(value) || sm.UserInformation.FirstName.ToLower().ToLower().Equals(value))
                                                             && sm.Status == status).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getScheduleMaster = db.ScheduleMasters
                                            .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4)
                                            .Where(sm => (sm.UserInformation.FirstName.ToLower().Contains(value) || sm.UserInformation.FirstName.ToLower().ToLower().Equals(value))
                                                                            && sm.Status == status).OrderBy(sm => sm.Id).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    scheduleMaster = getScheduleMaster;
                }
            }
            else if (property.Equals("DentistMiddleName"))
            {
                value = value.ToLower();
                var records = db.ScheduleMasters.Where(sm => (sm.UserInformation.MiddleName.ToLower().Contains(value) || sm.UserInformation.MiddleName.ToLower().ToLower().Equals(value))
                                                              && sm.Status == status).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getScheduleMaster = db.ScheduleMasters
                                              .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4)
                                              .Where(sm => (sm.UserInformation.MiddleName.ToLower().Contains(value) || sm.UserInformation.MiddleName.ToLower().ToLower().Equals(value))
                                                                            && sm.Status == status).OrderBy(sm => sm.Id).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    scheduleMaster = getScheduleMaster;
                }
            }
            //Dentist Last Name
            else
            {
                value = value.ToLower();
                var records = db.ScheduleMasters.Where(sm => sm.UserInformation.LastName.ToLower().Contains(value) || sm.UserInformation.LastName.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getScheduleMaster = db.ScheduleMasters
                                              .Include(sm => sm.UserInformation).Where(ui => ui.UserInformation.User.UserTypeId == 4) 
                                              .Where(sm => sm.UserInformation.LastName.ToLower().Contains(value) || sm.UserInformation.LastName.ToLower().ToLower().Equals(value))
                                              .OrderBy(sm => sm.Id).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    scheduleMaster = getScheduleMaster;
                }
            }
        }
    }
}