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
    public class PatientDiagnosisHistoryMastersController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private Response response = new Response();
        private int pageSize = 20;
        // GET: api/PatientDiagnosisHistoryMasters
        public IQueryable<PatientDiagnosisHistoryMaster> GetPatientDiagnosisHistoryMasters()
        {
            return db.PatientDiagnosisHistoryMasters;
        }

        // GET: api/PatientDiagnosisHistoryMasters?length=0
        public IHttpActionResult GetPatientDiagnosisHistoryMaster(int length)
        {
            int fetch;
            var records = db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.Status != 0).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;
                var pdh = db.PatientDiagnosisHistoryMasters
                    .Include(p => p.User.UserInformations)
                    .Include(p => p.Appointment.ScheduleMaster)
                    .Include(p => p.Appointment.ScheduleMaster.UserInformation)
                    .Include(p => p.Appointment.ScheduleDetail)
                    .Where(p =>  p.Status != 0).OrderByDescending(p => p.Appointment.ScheduleMaster.Date).Skip((length)).Take(fetch).ToArray();
                for (int i = 0; i < pdh.Length; i++)
                {
                    pdh[i].User.Appointments = null;
                    pdh[i].User.Appointments = null;
                    pdh[i].User.Messages = null;
                    pdh[i].User.Messages1 = null;
                    pdh[i].User.Notifications = null;
                    pdh[i].User.PatientDentalHistories = null;
                    pdh[i].User.PatientDiagnosisHistoryMasters = null;
                    pdh[i].User.PatientMedicalHistories = null;
                    pdh[i].User.UserType = null;
                    pdh[i].Appointment.ScheduleMaster.Appointments = null;
                    pdh[i].Appointment.ScheduleMaster.ScheduleDetails = null;
                    pdh[i].Appointment.ScheduleDetail.Appointments = null;
                    pdh[i].Appointment.ScheduleDetail.ScheduleMaster = null;
                    pdh[i].Appointment.ScheduleMaster.UserInformation.PatientMouths = null;
                    pdh[i].Appointment.ScheduleMaster.UserInformation.ScheduleMasters = null;
                    pdh[i].Appointment.ScheduleMaster.UserInformation.CivilStatu = null;
                    pdh[i].Appointment.ScheduleMaster.UserInformation.User = null;
                    foreach (var ui in pdh[i].User.UserInformations)
                    {
                        ui.CivilStatu = null;
                        ui.PatientMouths = null;
                        ui.ScheduleMasters = null;
                    }
                }
                return Ok(pdh);
            }
            else
            {
                return Ok();
            }
        }

        //Filtering for a specif user's Appointments
        public IHttpActionResult GetPatientDiagnosisHistoryMasters(int length, string property, string value, string value2)
        {
            PatientDiagnosisHistoryMaster[] diagnosisHistoryMaster = new PatientDiagnosisHistoryMaster[pageSize];
            this.filterRecord(length, property, value, value2, ref diagnosisHistoryMaster);
            if (diagnosisHistoryMaster != null)
                return Ok(diagnosisHistoryMaster);
            else
                return Ok();
        }

        // PUT: api/PatientDiagnosisHistoryMasters/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutPatientDiagnosisHistoryMaster(int id, PatientDiagnosisHistoryMaster patientDiagnosisHistoryMaster)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid || id != patientDiagnosisHistoryMaster.Id)
            {
                response.message = "Bad request.";
                return Ok(response);
            }


            db.Entry(patientDiagnosisHistoryMaster).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = patientDiagnosisHistoryMaster;
            }
            catch (Exception e)
            {
                if (!PatientDiagnosisHistoryMasterExists(id))
                {
                    response.message = "Diagnosis History doesn't exist.";
                }
                else
                {
                    response.message = e.InnerException.InnerException.Message.ToString();
                }
            }

            return Ok(response);
        }

        // POST: api/PatientDiagnosisHistoryMasters
        [ResponseType(typeof(PatientDiagnosisHistoryMaster))]
        public IHttpActionResult PostPatientDiagnosisHistoryMaster(PatientDiagnosisHistoryMaster patientDiagnosisHistoryMaster)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }
            try
            {
                db.PatientDiagnosisHistoryMasters.Add(patientDiagnosisHistoryMaster);
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = patientDiagnosisHistoryMaster;
            }
            catch (Exception e) 
            {
                response.message = e.InnerException.InnerException.Message.ToString();
            }

            return Ok(response);
        }

        // DELETE: api/PatientDiagnosisHistoryMasters/5
        [ResponseType(typeof(PatientDiagnosisHistoryMaster))]
        public IHttpActionResult DeletePatientDiagnosisHistoryMaster(int id)
        {
            response.status = "FAILURE";
            PatientDiagnosisHistoryMaster patientDiagnosisHistoryMaster = db.PatientDiagnosisHistoryMasters.Find(id);

            if (patientDiagnosisHistoryMaster == null)
            {
                response.message = "Diagnosis History doesn't exist.";
                return Ok(response);
            }
            try 
            {
                PatientDiagnosisHistoryMaster patientDiagnosisHistoryMasterEdited = db.PatientDiagnosisHistoryMasters.Find(id);
                patientDiagnosisHistoryMasterEdited.Status = 0;
                db.Entry(patientDiagnosisHistoryMaster).CurrentValues.SetValues(patientDiagnosisHistoryMasterEdited);
                db.Entry(patientDiagnosisHistoryMaster).State = EntityState.Modified;
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

        private bool PatientDiagnosisHistoryMasterExists(int id)
        {
            return db.PatientDiagnosisHistoryMasters.Count(e => e.Id == id) > 0;
        }

        //Filtering for Normal Appointments
        public void filterRecord(int length, string property, string value, string value2, ref PatientDiagnosisHistoryMaster[] diagnosisHistoryMaster)
        {
            /* Fields that can be filter
             * Patient First Name
             * Patient Middle Name
             * Patient Last Name
             * Appointment Date
             * Appointment From Time
             * Appointment To Time
             */
            //Filter for a specific patient
            int fetch;
            diagnosisHistoryMaster = null;
            if (property.Equals("AppointmentDate"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Date");
                var records = db.PatientDiagnosisHistoryMasters.Where(pdhm => (pdhm.Appointment.ScheduleMaster.Date >= strManipulate.dateValue && pdhm.Appointment.ScheduleMaster.Date <= strManipulate.dateValue2)
                                                                      && pdhm.Status != 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDiagnosisHistoryMaster = db.PatientDiagnosisHistoryMasters
                        .Include(pdhm => pdhm.User.UserInformations)
                        .Include(pdhm => pdhm.Appointment.ScheduleMaster.UserInformation)
                        .Include(pdhm => pdhm.Appointment.ScheduleMaster)
                        .Include(pdhm => pdhm.Appointment.ScheduleDetail)
                        .Where(pdhm => (pdhm.Appointment.ScheduleMaster.Date >= strManipulate.dateValue && pdhm.Appointment.ScheduleMaster.Date <= strManipulate.dateValue2)
                                                            && pdhm.Status != 0).OrderByDescending(pdhm => pdhm.Appointment.ScheduleMaster.Date).Skip((length)).Take(fetch).ToArray();
                    diagnosisHistoryMaster = getDiagnosisHistoryMaster;
                }
            }
            else if (property.Equals("ScheduledFromTime"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Time");
                var records = db.PatientDiagnosisHistoryMasters.Where(pdhm => (pdhm.Appointment.ScheduleDetail.FromTime >= strManipulate.timeValue && pdhm.Appointment.ScheduleDetail.ToTime <= strManipulate.timeValue2)
                                                                      && pdhm.Status != 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDiagnosisHistoryMaster = db.PatientDiagnosisHistoryMasters
                        .Include(pdhm => pdhm.User.UserInformations)
                        .Include(pdhm => pdhm.Appointment.ScheduleMaster)
                        .Include(pdhm => pdhm.Appointment.ScheduleDetail)
                        .Where(pdhm => (pdhm.Appointment.ScheduleDetail.FromTime >= strManipulate.timeValue && pdhm.Appointment.ScheduleDetail.ToTime <= strManipulate.timeValue2)
                                                            && pdhm.Status != 0).OrderByDescending(pdhm => pdhm.Appointment.ScheduleMaster.Date).Skip((length)).Take(fetch).ToArray();
                    diagnosisHistoryMaster = getDiagnosisHistoryMaster;
                }
            }
            else if (property.Equals("ScheduledToTime"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Time");
                var records = db.PatientDiagnosisHistoryMasters.Where(pdhm => (pdhm.Appointment.ScheduleDetail.FromTime >= strManipulate.timeValue && pdhm.Appointment.ScheduleDetail.ToTime <= strManipulate.timeValue2)
                                                                      && pdhm.Status != 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDiagnosisHistoryMaster = db.PatientDiagnosisHistoryMasters
                        .Include(pdhm => pdhm.User.UserInformations)
                        .Include(pdhm => pdhm.Appointment.ScheduleMaster.UserInformation)
                        .Include(pdhm => pdhm.Appointment.ScheduleMaster)
                        .Include(pdhm => pdhm.Appointment.ScheduleDetail)
                        .Where(pdhm => (pdhm.Appointment.ScheduleDetail.FromTime >= strManipulate.timeValue && pdhm.Appointment.ScheduleDetail.ToTime <= strManipulate.timeValue2)
                                                            && pdhm.Status != 0).OrderByDescending(pdhm => pdhm.Appointment.ScheduleMaster.Date).Skip((length)).Take(fetch).ToArray();
                    diagnosisHistoryMaster = getDiagnosisHistoryMaster;
                }
            }
            else if (property.Equals("PatientFirstName"))
            {
                value = value.ToLower();
                var records = db.PatientDiagnosisHistoryMasters.Where(pdhm => (pdhm.User.UserInformations.FirstOrDefault().FirstName.ToLower().Contains(value)
                                                          || pdhm.User.UserInformations.FirstOrDefault().FirstName.ToLower().Equals(value))
                                                          && pdhm.Status != 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDiagnosisHistoryMaster = db.PatientDiagnosisHistoryMasters
                        .Include(pdhm => pdhm.User.UserInformations)
                        .Include(pdhm => pdhm.Appointment.ScheduleMaster)
                        .Include(pdhm => pdhm.Appointment.ScheduleDetail)
                        .Where(pdhm => (pdhm.Appointment.User.UserInformations.FirstOrDefault().FirstName.ToLower().Contains(value)
                                        || pdhm.Appointment.User.UserInformations.FirstOrDefault().FirstName.ToLower().Equals(value))
                                        && pdhm.Status != 0).OrderByDescending(pdhm => pdhm.Appointment.ScheduleDetail.FromTime).Skip((length)).Take(fetch).ToArray();
                    diagnosisHistoryMaster = getDiagnosisHistoryMaster;
                }
            }
            else if (property.Equals("PatientLastName"))
            {
                value = value.ToLower();
                var records = db.PatientDiagnosisHistoryMasters.Where(pdhm => (pdhm.Appointment.User.UserInformations.FirstOrDefault().LastName.ToLower().Contains(value)
                                                          || pdhm.Appointment.User.UserInformations.FirstOrDefault().LastName.ToLower().Equals(value))
                                                          && pdhm.Status != 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDiagnosisHistoryMaster = db.PatientDiagnosisHistoryMasters
                        .Include(pdhm => pdhm.User.UserInformations)
                        .Include(pdhm => pdhm.Appointment.ScheduleMaster)
                        .Include(pdhm => pdhm.Appointment.ScheduleDetail)
                        .Where(pdhm => (pdhm.Appointment.User.UserInformations.FirstOrDefault().LastName.ToLower().Contains(value)
                                        || pdhm.Appointment.User.UserInformations.FirstOrDefault().LastName.ToLower().Equals(value))
                                        && pdhm.Status != 0).OrderByDescending(pdhm => pdhm.Appointment.ScheduleDetail.FromTime).Skip((length)).Take(fetch).ToArray();
                    diagnosisHistoryMaster = getDiagnosisHistoryMaster;
                }
            }
            else if (property.Equals("PatientMiddleName"))
            {
                value = value.ToLower();
                var records = db.PatientDiagnosisHistoryMasters.Where(pdhm => (pdhm.Appointment.User.UserInformations.FirstOrDefault().MiddleName.ToLower().Contains(value)
                                                          || pdhm.Appointment.User.UserInformations.FirstOrDefault().MiddleName.ToLower().Equals(value))
                                                          && pdhm.Status != 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDiagnosisHistoryMaster = db.PatientDiagnosisHistoryMasters
                        .Include(pdhm => pdhm.User.UserInformations)
                        .Include(pdhm => pdhm.Appointment.ScheduleMaster.UserInformation)
                        .Include(pdhm => pdhm.Appointment.ScheduleMaster)
                        .Include(pdhm => pdhm.Appointment.ScheduleDetail)
                        .Where(pdhm => (pdhm.Appointment.User.UserInformations.FirstOrDefault().MiddleName.ToLower().Contains(value)
                                        || pdhm.Appointment.User.UserInformations.FirstOrDefault().MiddleName.ToLower().Equals(value))
                                        && pdhm.Status != 0).OrderByDescending(pdhm => pdhm.Appointment.ScheduleDetail.FromTime).Skip((length)).Take(fetch).ToArray();
                    diagnosisHistoryMaster = getDiagnosisHistoryMaster;
                }
            }
            else if (property.Equals("DentistFirstName"))
            {
                value = value.ToLower();
                var records = db.PatientDiagnosisHistoryMasters.Where(pdhm => (pdhm.Appointment.ScheduleMaster.UserInformation.FirstName.ToLower().Contains(value)
                                                          || pdhm.Appointment.ScheduleMaster.UserInformation.FirstName.ToLower().Equals(value))
                                                          && pdhm.Status != 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDiagnosisHistoryMaster = db.PatientDiagnosisHistoryMasters
                        .Include(pdhm => pdhm.User.UserInformations)
                        .Include(pdhm => pdhm.Appointment.ScheduleMaster)
                        .Include(pdhm => pdhm.Appointment.ScheduleDetail)
                        .Where(pdhm => (pdhm.Appointment.ScheduleMaster.UserInformation.FirstName.ToLower().Contains(value)
                                        || pdhm.Appointment.ScheduleMaster.UserInformation.FirstName.ToLower().Equals(value))
                                        && pdhm.Status != 0).OrderByDescending(pdhm => pdhm.Appointment.ScheduleDetail.FromTime).Skip((length)).Take(fetch).ToArray();
                    diagnosisHistoryMaster = getDiagnosisHistoryMaster;
                }
            }
            else if (property.Equals("DentistLastName"))
            {
                value = value.ToLower();
                var records = db.PatientDiagnosisHistoryMasters.Where(pdhm => (pdhm.Appointment.ScheduleMaster.UserInformation.LastName.ToLower().Contains(value)
                                                          || pdhm.Appointment.ScheduleMaster.UserInformation.LastName.ToLower().Equals(value))
                                                          && pdhm.Status != 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDiagnosisHistoryMaster = db.PatientDiagnosisHistoryMasters
                        .Include(pdhm => pdhm.User.UserInformations)
                        .Include(pdhm => pdhm.Appointment.ScheduleMaster)
                        .Include(pdhm => pdhm.Appointment.ScheduleDetail)
                        .Where(pdhm => (pdhm.Appointment.ScheduleMaster.UserInformation.LastName.ToLower().Contains(value)
                                        || pdhm.Appointment.ScheduleMaster.UserInformation.LastName.ToLower().Equals(value))
                                        && pdhm.Status != 0).OrderByDescending(pdhm => pdhm.Appointment.ScheduleDetail.FromTime).Skip((length)).Take(fetch).ToArray();
                    diagnosisHistoryMaster = getDiagnosisHistoryMaster;
                }
            }
            //Dentist Middle Name
            else
            {
                value = value.ToLower();
                var records = db.PatientDiagnosisHistoryMasters.Where(pdhm => (pdhm.Appointment.ScheduleMaster.UserInformation.MiddleName.ToLower().Contains(value)
                                                          || pdhm.Appointment.ScheduleMaster.UserInformation.MiddleName.ToLower().Equals(value))
                                                          && pdhm.Status != 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getDiagnosisHistoryMaster = db.PatientDiagnosisHistoryMasters
                        .Include(pdhm => pdhm.User.UserInformations)
                        .Include(pdhm => pdhm.Appointment.ScheduleMaster)
                        .Include(pdhm => pdhm.Appointment.ScheduleDetail)
                        .Where(pdhm => (pdhm.Appointment.ScheduleMaster.UserInformation.MiddleName.ToLower().Contains(value)
                                        || pdhm.Appointment.ScheduleMaster.UserInformation.MiddleName.ToLower().Equals(value))
                                        && pdhm.Status != 0).OrderByDescending(pdhm => pdhm.Appointment.ScheduleDetail.FromTime).Skip((length)).Take(fetch).ToArray();
                    diagnosisHistoryMaster = getDiagnosisHistoryMaster;
                }
            }
            if (diagnosisHistoryMaster != null)
            {
                for (int i = 0; i < diagnosisHistoryMaster.Length; i++)
                {
                    diagnosisHistoryMaster[i].User.Appointments = null;
                    diagnosisHistoryMaster[i].User.Appointments = null;
                    diagnosisHistoryMaster[i].User.Messages = null;
                    diagnosisHistoryMaster[i].User.Messages1 = null;
                    diagnosisHistoryMaster[i].User.Notifications = null;
                    diagnosisHistoryMaster[i].User.PatientDentalHistories = null;
                    diagnosisHistoryMaster[i].User.PatientDiagnosisHistoryMasters = null;
                    diagnosisHistoryMaster[i].User.PatientMedicalHistories = null;
                    diagnosisHistoryMaster[i].User.UserType = null;
                    diagnosisHistoryMaster[i].Appointment.ScheduleMaster.Appointments = null;
                    diagnosisHistoryMaster[i].Appointment.ScheduleMaster.ScheduleDetails = null;
                    diagnosisHistoryMaster[i].Appointment.ScheduleDetail.Appointments = null;
                    diagnosisHistoryMaster[i].Appointment.ScheduleDetail.ScheduleMaster = null;
                    diagnosisHistoryMaster[i].Appointment.ScheduleMaster.UserInformation.PatientMouths = null;
                    diagnosisHistoryMaster[i].Appointment.ScheduleMaster.UserInformation.ScheduleMasters = null;
                    diagnosisHistoryMaster[i].Appointment.ScheduleMaster.UserInformation.CivilStatu = null;
                    diagnosisHistoryMaster[i].Appointment.ScheduleMaster.UserInformation.User = null;
                    foreach (var ui in diagnosisHistoryMaster[i].User.UserInformations)
                    {
                        ui.CivilStatu = null;
                        ui.PatientMouths = null;
                        ui.ScheduleMasters = null;
                    }
                }
            }
        }
    }
}