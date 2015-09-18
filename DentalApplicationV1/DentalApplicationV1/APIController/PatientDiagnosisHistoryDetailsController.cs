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
    public class PatientDiagnosisHistoryDetailsController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private Response response = new Response();
        private int pageSize = 20;
        // GET: api/PatientDiagnosisHistoryDetails
        public IQueryable<PatientDiagnosisHistoryDetail> GetPatientDiagnosisHistoryDetails()
        {
            return db.PatientDiagnosisHistoryDetails;
        }

        // GET: api/PatientDiagnosisHistoryDetails
        public IHttpActionResult GetPatientDiagnosisHistoryDetails(int length, int masterId)
        {
            int fetch;
            var records = db.PatientDiagnosisHistoryDetails.Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;
                var pdh = db.PatientDiagnosisHistoryDetails.Include(p => p.TreatmentType).ToArray();

                for (int i = 0; i < pdh.Length; i++)
                    pdh[i].TreatmentType.PatientDiagnosisHistoryDetails = null;

                return Ok(pdh);
            }
            else
            {
                return Ok();
            }      
        }

        // GET: api/PatientDiagnosisHistoryDetails/5
        [ResponseType(typeof(PatientDiagnosisHistoryDetail))]
        public IHttpActionResult GetPatientDiagnosisHistoryDetail(int id)
        {
            PatientDiagnosisHistoryDetail patientDiagnosisHistoryDetail = db.PatientDiagnosisHistoryDetails.Find(id);
            if (patientDiagnosisHistoryDetail == null)
            {
                return NotFound();
            }

            return Ok(patientDiagnosisHistoryDetail);
        }

        // PUT: api/PatientDiagnosisHistoryDetails/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutPatientDiagnosisHistoryDetail(int id, PatientDiagnosisHistoryDetail patientDiagnosisHistoryDetail)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid || id != patientDiagnosisHistoryDetail.Id)
            {
                response.message = "FAILURE";
                return Ok(response);
            }

            db.Entry(patientDiagnosisHistoryDetail).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = patientDiagnosisHistoryDetail;
            }
            catch (Exception e)
            {
                if (!PatientDiagnosisHistoryDetailExists(id))
                {
                    response.message = "Diagnosis detail doesn't exist.";
                }
                else
                {
                    response.message = e.InnerException.InnerException.Message.ToString();
                }
            }

            return Ok(response);
        }

        // POST: api/PatientDiagnosisHistoryDetails
        [ResponseType(typeof(PatientDiagnosisHistoryDetail))]
        public IHttpActionResult PostPatientDiagnosisHistoryDetail(PatientDiagnosisHistoryDetail patientDiagnosisHistoryDetail)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }
            try
            {
                db.PatientDiagnosisHistoryDetails.Add(patientDiagnosisHistoryDetail);
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = patientDiagnosisHistoryDetail;
            }
            catch (Exception e)
            {
                response.message = e.InnerException.InnerException.Message.ToString();
            }

            return Ok(response);
        }

        // DELETE: api/PatientDiagnosisHistoryDetails/5
        [ResponseType(typeof(PatientDiagnosisHistoryDetail))]
        public IHttpActionResult DeletePatientDiagnosisHistoryDetail(int id)
        {
            response.status = "FAILURE";
            PatientDiagnosisHistoryDetail patientDiagnosisHistoryDetail = db.PatientDiagnosisHistoryDetails.Find(id);
            if (patientDiagnosisHistoryDetail == null)
            {
                response.message = "Diagnosis detail doesn't exist.";
            }
            try
            {
                db.PatientDiagnosisHistoryDetails.Remove(patientDiagnosisHistoryDetail);
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

        private bool PatientDiagnosisHistoryDetailExists(int id)
        {
            return db.PatientDiagnosisHistoryDetails.Count(e => e.Id == id) > 0;
        }
    }
}