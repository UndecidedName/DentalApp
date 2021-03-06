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

namespace DentalApplicationV1.APIController
{
    public class TreatmentTypesController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private Response response = new Response();
        private int pageSize = 20;
        // GET: api/TreatmentTypes
        public IQueryable<TreatmentType> GetTreatmentTypes()
        {
            return db.TreatmentTypes;
        }
        // GET: api/TreatmentTypes?length=0
        public IQueryable<TreatmentType> GetTreatmentTypes(int length)
        {
            int fetch;
            var records = db.TreatmentTypes.Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.TreatmentTypes
                    .OrderBy(tt => tt.Name).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<TreatmentType> tt = new List<TreatmentType>().AsQueryable();
                return tt;
            }
        }
        // GET: api/TreatmentTypes?length=0&status=1
        public IQueryable<TreatmentType> GetTreatmentTypes(int length, int status)
        {
            int fetch;
            var records = db.TreatmentTypes.Where(tt => tt.Status == status).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.TreatmentTypes
                    .Where(tt => tt.Status == status)
                    .OrderBy(tt => tt.Name).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<TreatmentType> tt = new List<TreatmentType>().AsQueryable();
                return tt;
            }
        }
        // GET: api/TreatmentTypes/5
        [ResponseType(typeof(TreatmentType))]
        public IHttpActionResult GetTreatmentType(int id)
        {
            TreatmentType treatmentType = db.TreatmentTypes.Find(id);
            if (treatmentType == null)
            {
                return NotFound();
            }

            return Ok(treatmentType);
        }

        //Filtering
        public IHttpActionResult GetTreatmentType(int length, string property, string value, string value2)
        {
            TreatmentType[] treatmentType = new TreatmentType[pageSize];
            this.filterRecord(length, property, value, value2, ref treatmentType);
            if (treatmentType != null)
                return Ok(treatmentType);
            else
                return Ok();
        }

        //Filtering
        public IHttpActionResult GetTreatmentType(int length, int status, string property, string value, string value2)
        {
            TreatmentType[] treatmentType = new TreatmentType[pageSize];
            this.filterRecord(length, status, property, value, value2, ref treatmentType);
            if (treatmentType != null)
                return Ok(treatmentType);
            else
                return Ok();
        }

        // PUT: api/TreatmentTypes/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutTreatmentType(int id, TreatmentType treatmentType)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid || id != treatmentType.Id)
            {
                response.message = "Bad request.";
                return Ok(response);
            }

            db.Entry(treatmentType).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = treatmentType;
            }
            catch (Exception e)
            {
                if (!TreatmentTypeExists(id))
                {
                    response.message = "Treatment type doesn't exist.";
                }
                else
                {
                    response.message = e.InnerException.InnerException.Message.ToString();
                }
            }

            return Ok(response);
        }

        // POST: api/TreatmentTypes
        [ResponseType(typeof(TreatmentType))]
        public IHttpActionResult PostTreatmentType(TreatmentType treatmentType)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }
            try 
            {
                db.TreatmentTypes.Add(treatmentType);
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = treatmentType;
            }
            catch (Exception e) {
                response.message = e.InnerException.InnerException.Message.ToString();
            }

            return Ok(response);
        }

        // DELETE: api/TreatmentTypes/5
        [ResponseType(typeof(TreatmentType))]
        public IHttpActionResult DeleteTreatmentType(int id)
        {
            response.status = "FAILURE";
            TreatmentType treatmentType = db.TreatmentTypes.Find(id);
            if (treatmentType == null)
            {
                response.message = "Treatment Type doesn't exist.";
                return Ok(response);
            }
            try
            {
                db.TreatmentTypes.Remove(treatmentType);
                db.SaveChanges();
                response.status = "SUCCESS";
            }
            catch (Exception e)
            {
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

        private bool TreatmentTypeExists(int id)
        {
            return db.TreatmentTypes.Count(e => e.Id == id) > 0;
        }

        public void filterRecord(int length, string property, string value, string value2, ref TreatmentType[] treatmentType)
        {
            /* Fields that can be filter
             * Name
             * Desription
             * Status
             */
            //Filter for a specific patient
            int fetch;
            treatmentType = null;
            if (property.Equals("Name"))
            {
                value = value.ToLower();
                var records = db.TreatmentTypes.Where(cs => cs.Name.ToLower().Contains(value) || cs.Name.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getTreatmentType = db.TreatmentTypes.Where(cs => cs.Name.ToLower().Contains(value) || cs.Name.ToLower().ToLower().Equals(value))
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    treatmentType = getTreatmentType;
                }
            }
            else if (property.Equals("Description"))
            {
                value = value.ToLower();
                var records = db.TreatmentTypes.Where(cs => cs.Description.ToLower().Contains(value) || cs.Description.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getTreatmentType = db.TreatmentTypes.Where(cs => cs.Description.ToLower().Contains(value) || cs.Description.ToLower().ToLower().Equals(value))
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    treatmentType = getTreatmentType;
                }
            }
            //status
            else
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Integer");
                var records = db.TreatmentTypes.Where(cs => cs.Status == strManipulate.intValue).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getTreatmentType = db.TreatmentTypes.Where(cs => cs.Status == strManipulate.intValue)
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    treatmentType = getTreatmentType;
                }
            }
        }

        public void filterRecord(int length, int status, string property, string value, string value2, ref TreatmentType[] treatmentType)
        {
            /* Fields that can be filter
             * Name
             * Desription
             * Status
             */
            //Filter for a specific patient
            int fetch;
            treatmentType = null;
            if (property.Equals("Name"))
            {
                value = value.ToLower();
                var records = db.TreatmentTypes.Where(cs => cs.Name.ToLower().Contains(value) || cs.Name.ToLower().ToLower().Equals(value))
                                               .Where(cs => cs.Status == 1).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getTreatmentType = db.TreatmentTypes.Where(cs => cs.Name.ToLower().Contains(value) || cs.Name.ToLower().ToLower().Equals(value))
                        .Where(cs => cs.Status == 1)
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    treatmentType = getTreatmentType;
                }
            }
            else if (property.Equals("Description"))
            {
                value = value.ToLower();
                var records = db.TreatmentTypes.Where(cs => cs.Description.ToLower().Contains(value) || cs.Description.ToLower().ToLower().Equals(value))
                                               .Where(cs => cs.Status == 1).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getTreatmentType = db.TreatmentTypes.Where(cs => cs.Description.ToLower().Contains(value) || cs.Description.ToLower().ToLower().Equals(value))
                        .Where(cs => cs.Status == 1)
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    treatmentType = getTreatmentType;
                }
            }
            //status
            else
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Integer");
                var records = db.TreatmentTypes.Where(cs => cs.Status == strManipulate.intValue).Where(cs => cs.Status == 1).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getTreatmentType = db.TreatmentTypes.Where(cs => cs.Status == strManipulate.intValue)
                        .Where(cs => cs.Status == 1)
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    treatmentType = getTreatmentType;
                }
            }
        }
    }
}