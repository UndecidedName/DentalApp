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
    public class CivilStatusController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private Response response = new Response();
        private int pageSize = 20;

        // GET: api/CivilStatus
        public IQueryable<CivilStatu> GetCivilStatus()
        {
            return db.CivilStatus;
        }

        public IHttpActionResult GetCivilStatus(int length)
        {
            int fetch;
            var records = db.CivilStatus.Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                var getCivilStatus = db.CivilStatus
                                     .OrderBy(m => m.Name).Skip((length)).Take(fetch).ToArray();
                for (int i = 0; i < getCivilStatus.Length; i++)
                {
                    getCivilStatus[i].UserInformations = null;
                }
                    return Ok(getCivilStatus);
            }
            else
            {
                return Ok();
            }
        }

        public IHttpActionResult GetCivilStatus(int length, int status)
        {
            int fetch;
            var records = db.CivilStatus.Where(dm => dm.Status == status).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                var getCivilStatus = db.CivilStatus
                    .Where(dm => dm.Status == status)
                    .OrderBy(m => m.Name).Skip((length)).Take(fetch).ToArray();
                for (int i = 0; i < getCivilStatus.Length; i++)
                {
                    getCivilStatus[i].UserInformations = null;
                }
                return Ok(getCivilStatus);
                    
            }
            else
            {
                return Ok();
            }
        }

        //Filtering
        public IHttpActionResult GetCivilStatus(int length, string property, string value, string value2)
        {
            CivilStatu[] civilStatus = new CivilStatu[pageSize];
            this.filterRecord(length, property, value, value2, ref civilStatus);
            if (civilStatus != null)
                return Ok(civilStatus);
            else
                return Ok();
        }
        // GET: api/CivilStatus/5
        [ResponseType(typeof(CivilStatu))]
        public IHttpActionResult GetCivilStatu(int id)
        {
            CivilStatu civilStatu = db.CivilStatus.Find(id);
            civilStatu.UserInformations = null;
            if (civilStatu == null)
            {
                return NotFound();
            }

            return Ok(civilStatu);
        }

        // PUT: api/CivilStatus/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutCivilStatu(int id, CivilStatu civilStatu)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid || id != civilStatu.Id)
            {
                response.message = "Bad request.";
                return Ok(response);
            }

            db.Entry(civilStatu).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = civilStatu;
            }
            catch (Exception e)
            {
                if (!CivilStatuExists(id))
                {
                    response.message = "Civil status doesn't exist.";
                }
                else
                {
                    response.message = e.InnerException.InnerException.Message.ToString();
                }
            }

            return Ok(response);
        }

        // POST: api/CivilStatus
        [ResponseType(typeof(CivilStatu))]
        public IHttpActionResult PostCivilStatu(CivilStatu civilStatu)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }
            try
            {
                db.CivilStatus.Add(civilStatu);
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = civilStatu;
            }
            catch (Exception e) {
                e.InnerException.InnerException.Message.ToString();
            }

            return Ok(response);
        }

        // DELETE: api/CivilStatus/5
        [ResponseType(typeof(CivilStatu))]
        public IHttpActionResult DeleteCivilStatu(int id)
        {
            response.status = "FAILURE";
            CivilStatu civilStatu = db.CivilStatus.Find(id);
            if (civilStatu == null)
            {
                response.message = "Civil status doesn't exist.";
                return Ok(response);
            }
            try
            {
                db.CivilStatus.Remove(civilStatu);
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = civilStatu;
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

        public void filterRecord(int length, string property, string value, string value2, ref CivilStatu[] civilStatus)
        {
            /* Fields that can be filter
             * Name
             * Desription
             * Status
             */
            //Filter for a specific patient
            int fetch;
            civilStatus = null;
            if (property.Equals("Name"))
            {
                value = value.ToLower();
                var records = db.CivilStatus.Where(cs => cs.Name.ToLower().Contains(value) || cs.Name.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getCivilStatus = db.CivilStatus.Where(cs => cs.Name.ToLower().Contains(value) || cs.Name.ToLower().ToLower().Equals(value))
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    civilStatus = getCivilStatus;
                }
            }
            else if (property.Equals("Description"))
            {
                value = value.ToLower();
                var records = db.CivilStatus.Where(cs => cs.Description.ToLower().Contains(value) || cs.Description.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getCivilStatus = db.CivilStatus.Where(cs => cs.Description.ToLower().Contains(value) || cs.Description.ToLower().ToLower().Equals(value))
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    civilStatus = getCivilStatus;
                }
            }
            //status
            else
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Integer");
                var records = db.CivilStatus.Where(cs => cs.Status == strManipulate.intValue).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getCivilStatus = db.CivilStatus.Where(cs => cs.Status == strManipulate.intValue)
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    civilStatus = getCivilStatus;
                }
            }
        }
        private bool CivilStatuExists(int id)
        {
            return db.CivilStatus.Count(e => e.Id == id) > 0;
        }
    }
}