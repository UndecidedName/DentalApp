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
using System.Data.Common;

namespace DentalApplicationV1.APIController
{
    public class AppointmentsController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private ScheduleDetailsController ScheduleDetail = new ScheduleDetailsController();
        private ScheduleMastersController ScheduleMaster = new ScheduleMastersController();
        private Response response = new Response();
        private int pageSize = 20;
        // GET: api/Appointments
        public IQueryable<Appointment> GetAppointments()
        {
            return db.Appointments;
        }
        
        // GET: api/Appointments?length=0&userId=1
        public IHttpActionResult GetAppointment(int length, int userId)
        {
            int fetch;
            var records = db.Appointments.Where(a => a.PatientId == userId && a.Status != 3).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;
                var appointments = db.Appointments
                    .Include(a => a.User.UserInformations)
                    .Include(a => a.ScheduleMaster)
                    .Include(a => a.ScheduleDetail)
                    .Include(a => a.ScheduleMaster.UserInformation)
                    .Where(a => a.PatientId == userId && a.Status != 3).OrderByDescending(a => a.ScheduleMaster.Date).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                return Ok(appointments);
            }
            else
            {
                return Ok();
            }
        }

        // GET: api/Appointments?length=0&userId=1&status=1
        //Api that will get list of appointments that are not found in diagnosis master
        public IHttpActionResult GetAppointment(int length, int userId, int status)
        {
            int fetch;
            var records = db.Appointments.Where(a => a.PatientId == userId && a.Status == status)
                                         .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;
                var appointments = db.Appointments
                    .Include(a => a.User.UserInformations)
                    .Include(a => a.ScheduleMaster)
                    .Include(a => a.ScheduleDetail)
                    .Include(a => a.ScheduleMaster.UserInformation)
                    .Where(a => a.PatientId == userId && a.Status == status)
                    .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0)
                    .OrderByDescending(a => a.ScheduleMaster.Date).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                return Ok(appointments);
            }
            else
            {
                return Ok();
            }
        }

        // GET: api/Appointments?length=0&type=AllAppointments
        public IHttpActionResult GetAppointment(int length, String type)
        {
            int fetch;
            if (type.Equals("AllAppointments"))
            {
                var records = db.Appointments.Where(a => a.Status != 3).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var appointments = db.Appointments
                        .Include(a => a.User.UserInformations)
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => a.Status != 3).OrderByDescending(a => a.ScheduleMaster.Date).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    return Ok(appointments);
                }
                else
                {
                    return Ok();
                }
            }
            //Special Appointments
            else
            {
                var records = db.Appointments.Where(a => a.Status != 3 && a.Type.Equals("SpecialAppointment")).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var appointments = db.Appointments
                        .Include(a => a.User.UserInformations)
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => a.Status != 3 && a.Type.Equals("SpecialAppointment")).OrderByDescending(a => a.ScheduleMaster.Date).Skip((length)).Take(fetch).ToArray();
                    if (appointments != null)
                    {
                        for (int i = 0; i < appointments.Length; i++)
                        {
                            appointments[i].User.Appointments = null;
                            appointments[i].User.Messages = null;
                            appointments[i].User.Messages1 = null;
                            appointments[i].User.Notifications = null;
                            appointments[i].User.PatientDentalHistories = null;
                            appointments[i].User.PatientDiagnosisHistoryMasters = null;
                            appointments[i].User.PatientMedicalHistories = null;
                            appointments[i].User.UserType = null;
                            appointments[i].PatientDiagnosisHistoryMasters = null;
                            appointments[i].ScheduleMaster.Appointments = null;
                            appointments[i].ScheduleMaster.ScheduleDetails = null;
                            appointments[i].ScheduleDetail.Appointments = null;
                            appointments[i].ScheduleDetail.ScheduleMaster = null;
                            appointments[i].ScheduleMaster.UserInformation.PatientMouths = null;
                            appointments[i].ScheduleMaster.UserInformation.ScheduleMasters = null;
                            appointments[i].ScheduleMaster.UserInformation.CivilStatu = null;
                            appointments[i].ScheduleMaster.UserInformation.User = null;
                            foreach (var ui in appointments[i].User.UserInformations)
                            {
                                ui.CivilStatu = null;
                                ui.PatientMouths = null;
                                ui.ScheduleMasters = null;
                            }
                        }
                    }
                    return Ok(appointments);
                }
                else
                {
                    return Ok();
                }
            }
        }

        //Filtering base on status
        public IHttpActionResult GetAppointment(int length, int userId, int status, string property, string value, string value2)
        {
            Appointment[] appointments = new Appointment[pageSize];
            this.filterRecord(length, userId, status, property, value, value2, ref appointments);
            if (appointments != null)
                return Ok(appointments);
            else
                return Ok();
        }

        //Filtering for a specif user's Appointments
        public IHttpActionResult GetAppointment(int length, int userId, string property, string value, string value2)
        {
            Appointment []  appointments = new Appointment[pageSize];
            this.filterRecord(length, userId, property, value, value2, ref appointments);
            if (appointments != null)
                return Ok(appointments);
            else
                return Ok();
        }

        //Filtering for All type of Appointments
        public IHttpActionResult GetAppointment(int length, string type, string property, string value, string value2)
        {
            Appointment[] appointments = new Appointment[pageSize];
            if (type.Equals("special"))
                this.filterRecord(length, type, property, value, value2, ref appointments);
            else
                this.filterRecord(length, type, property, value, value2, ref appointments);
            if (appointments != null)
                return Ok(appointments);
            else
                return Ok();
        }

        // GET: api/Appointments/5
        [ResponseType(typeof(Appointment))]
        public IHttpActionResult GetAppointment(int id)
        {
            Appointment appointment = db.Appointments.Find(id);
            if (appointment == null)
            {
                return NotFound();
            }

            return Ok(appointment);
        }

        //Filtering for reports
        public IHttpActionResult PutAppointment(int length, Appointment[] appointment)
        {
            Appointment[] appointments = new Appointment[pageSize];
            this.filterRecord(length, appointment[0], appointment[1], ref appointments);

            if (appointments != null)
                return Ok(appointments);
            else
                return Ok();
        }
        
        // PUT: api/Appointments/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutAppointment(int id, Appointment appointment)
        {
            int scheduleMasterStatus = 0;
            response.status = "FAILURE";
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }

            if (id != appointment.Id)
            {
                response.message = "Appointment not found.";
                return Ok(response);
            }

            db.Entry(appointment).State = EntityState.Modified;

            try
            {
                //Check if appointment is already used as a reference in diagnosis
                var searchInDiagnosis = db.PatientDiagnosisHistoryMasters.Where(pdhm => pdhm.AppointmentId == appointment.Id).AsNoTracking().ToArray();
                if (searchInDiagnosis.Length > 0) {
                    response.message = "Appointment is already used in a patient's diagnosis.";
                    return Ok(response);
                }

                switch (appointment.Status) { 
                    case 2:
                        //open schedule detail and schedule master status if appointment is disapproved
                        ScheduleDetail.updateScheduleDetailStatus((int)appointment.ScheduleDetailId, 0);
                        ScheduleMaster.updateScheduleMasterStatus((int)appointment.ScheduleMasterId, ref scheduleMasterStatus);
                        break;
                    default:
                        //close schedule detail and schedule master status if appointment is approved
                        ScheduleDetail.updateScheduleDetailStatus((int)appointment.ScheduleDetailId, 1);
                        ScheduleMaster.updateScheduleMasterStatus((int)appointment.ScheduleMasterId, ref scheduleMasterStatus);
                        break;

                }
                db.SaveChanges();
                //Get appointment details for notification
                var getAppointment = db.Appointments.Where(a => a.Id == appointment.Id)
                    .Include(a => a.ScheduleMaster)
                    .Include(a => a.ScheduleDetail).ToArray();
                getAppointment[0].User = null;
                getAppointment[0].Message = null;
                getAppointment[0].PatientDiagnosisHistoryMasters = null;
                getAppointment[0].ScheduleMaster.Appointments = null;
                getAppointment[0].ScheduleMaster.ScheduleDetails = null;
                getAppointment[0].ScheduleMaster.UserInformation = null;
                getAppointment[0].ScheduleDetail.Appointments = null;
                getAppointment[0].ScheduleDetail.ScheduleMaster = null;

                response.status = "SUCCESS";
                response.objParam1 = getAppointment;
            }
            catch (Exception e)
            {
                if (!AppointmentExists(id))
                {
                    response.message = "Appointment not found.";
                }
                else
                {
                    response.message = e.InnerException.InnerException.Message.ToString();
                }
            }

            return Ok(response);
        }

        // POST: api/Appointments
        [ResponseType(typeof(Appointment))]
        public IHttpActionResult PostAppointment(Appointment appointment)
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
                var getScheduleMaster = db.ScheduleMasters.Find(appointment.ScheduleMasterId);
                var checkIfExistBaseOnDate = db.Appointments.Where(a => a.ScheduleMaster.Date == getScheduleMaster.Date)
                                                            .Where(a => a.PatientId == appointment.PatientId)
                                                            .Where(a => a.Status == 0 || a.Status == 1).ToArray();
                if (checkIfExistBaseOnDate.Length > 0)
                {
                    if (appointment.User.UserTypeId == 4 || appointment.User.UserTypeId == 5)
                        response.message = "Patient has already an appointment on that same day.";
                    else
                        response.message = "You already have an appoinment on that same day.";
                    return Ok(response);
                }
                //Appointment that are made by the secretary or dentist will be approved directly
                if (appointment.User.UserTypeId == 4 || appointment.User.UserTypeId == 5)
                    appointment.Status = 1;
                appointment.User = null;
                //save appointment
                saveAppointment(appointment, "dummy");
                //close schedule detail status
                ScheduleDetail.updateScheduleDetailStatus((int)appointment.ScheduleDetailId, 1);
                //update schedule master status
                ScheduleMaster.updateScheduleMasterStatus((int)appointment.ScheduleMasterId, ref scheduleMasterStatus);
                response.objParam1 = appointment;
                response.status = "SUCCESS";
            }
            catch (Exception e) {
                response.message = e.InnerException.InnerException.Message.ToString();
            }

            return Ok(response);
        }

        // DELETE: api/Appointments/5
        [ResponseType(typeof(Appointment))]
        public IHttpActionResult DeleteAppointment(int id)
        {
            int scheduleMasterStatus = 0;
            response.status = "FAILURE";
            Appointment appointment = db.Appointments.Find(id);
            if (appointment == null)
            {
                response.message = "Appointment not found.";
                return Ok(response);
            }
            //Check if appointment is already a reference in patient's diagnosis history
            var searchDiagnosis = db.PatientDiagnosisHistoryMasters.Where(phm => phm.AppointmentId == id).ToArray();
            if (searchDiagnosis.Length > 0)
            {
                response.message = "Appointment is already used in one of your session.";
                return Ok(response);
            }
            try
            {
                //cancel appointment status
                updateAppointmentStatus(id, 3);
                //open schedule detail status
                ScheduleDetail.updateScheduleDetailStatus((int)appointment.ScheduleDetailId, 0);
                //update schedule master status
                ScheduleMaster.updateScheduleMasterStatus((int)appointment.ScheduleMasterId, ref scheduleMasterStatus);

                //Get Appointment Details for notification
                var getAppointment = db.Appointments.Where(a => a.Id == appointment.Id)
                    .Include(a => a.User.UserInformations)
                    .Include(a => a.ScheduleMaster)
                    .Include(a => a.ScheduleDetail).ToArray();
                getAppointment[0].User.Appointments = null;
                getAppointment[0].User.Messages = null;
                getAppointment[0].User.Messages1 = null;
                getAppointment[0].User.Notifications = null;
                getAppointment[0].User.PatientDentalHistories = null;
                getAppointment[0].User.PatientDiagnosisHistoryMasters = null;
                getAppointment[0].User.PatientMedicalHistories = null;
                getAppointment[0].User.UserType = null;
                getAppointment[0].Message = null;
                getAppointment[0].PatientDiagnosisHistoryMasters = null;
                getAppointment[0].ScheduleMaster.Appointments = null;
                getAppointment[0].ScheduleMaster.ScheduleDetails = null;
                getAppointment[0].ScheduleMaster.UserInformation = null;
                getAppointment[0].ScheduleDetail.Appointments = null;
                getAppointment[0].ScheduleDetail.ScheduleMaster = null;
                response.status = "SUCCESS";
                response.objParam1 = getAppointment;
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

        private bool AppointmentExists(int id)
        {
            return db.Appointments.Count(e => e.Id == id) > 0;
        }

        public void saveAppointment(Appointment appointment, string dummy)
        {
            db.Appointments.Add(appointment);
            db.SaveChanges();
        }

        public void updateAppointmentStatus(int id, int status) {
            Appointment appointment = db.Appointments.Find(id);
            Appointment appointmentEdited = db.Appointments.Find(id);
            appointmentEdited.Status = status;
            db.Entry(appointment).CurrentValues.SetValues(appointmentEdited);
            db.Entry(appointment).State = EntityState.Modified;
            db.SaveChanges();
        }

        //Filtering appointments that are not found in diagnosis master
        public void filterRecord(int length, int userId, int status, string property, string value, string value2, ref Appointment[] appointments)
        {
            /* Fields that can be filter
             * Transaction Date
             * Patient First Name
             * Patient Middle Name
             * Patient Last Name
             * Dentist First Name
             * Dentist Middle Name
             * Dentist Last Name
             * Scheduled Date
             * Scheduled From Time
             * Scheduled To Time
             * Status
             */
            //Filter for a specific patient
            int fetch;
            appointments = null;
            if (property.Equals("TransactionDate"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Date");
                strManipulate.dateValue2 = strManipulate.dateValue2.AddHours(11);
                var records = db.Appointments.Where(a => (a.TransactionDate >= strManipulate.dateValue && a.TransactionDate <= strManipulate.dateValue2)
                                                            && a.PatientId == userId && a.Status == status)
                                             .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0)
                        .Where(a => (a.TransactionDate >= strManipulate.dateValue && a.TransactionDate <= strManipulate.dateValue2)
                                                            && a.PatientId == userId && a.Status == status).OrderByDescending(a => a.TransactionDate)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("ScheduledDate"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Date");
                var records = db.Appointments.Where(a => (a.ScheduleMaster.Date >= strManipulate.dateValue && a.ScheduleMaster.Date <= strManipulate.dateValue2)
                                                            && a.PatientId == userId && a.Status == status)
                                             .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0)
                        .Where(a => (a.ScheduleMaster.Date >= strManipulate.dateValue && a.ScheduleMaster.Date <= strManipulate.dateValue2)
                                                            && a.PatientId == userId && a.Status == status).OrderByDescending(a => a.ScheduleMaster.Date)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("ScheduledFromTime"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Time");
                var records = db.Appointments.Where(a => (a.ScheduleDetail.FromTime >= strManipulate.timeValue && a.ScheduleDetail.FromTime <= strManipulate.timeValue2)
                                                            && a.PatientId == userId && a.Status == status)
                                             .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0)
                        .Where(a => (a.ScheduleDetail.FromTime >= strManipulate.timeValue && a.ScheduleDetail.FromTime <= strManipulate.timeValue2)
                                    && a.PatientId == userId && a.Status == status).OrderByDescending(a => a.ScheduleDetail.FromTime)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("ScheduledToTime"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Time");
                var records = db.Appointments.Where(a => (a.ScheduleDetail.ToTime >= strManipulate.timeValue && a.ScheduleDetail.ToTime <= strManipulate.timeValue2)
                                                          && a.PatientId == userId && a.Status == status)
                                             .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0)
                        .Where(a => (a.ScheduleDetail.ToTime >= strManipulate.timeValue && a.ScheduleDetail.ToTime <= strManipulate.timeValue2)
                                    && a.PatientId == userId && a.Status == status).OrderByDescending(a => a.ScheduleDetail.FromTime)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("DentistFirstName"))
            {
                value = value.ToLower();
                var records = db.Appointments.Where(a => (a.ScheduleMaster.UserInformation.FirstName.ToLower().Contains(value)
                                                          || a.ScheduleMaster.UserInformation.FirstName.ToLower().Equals(value))
                                                          && a.PatientId == userId && a.Status == status)
                                             .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0)
                        .Where(a => (a.ScheduleMaster.UserInformation.FirstName.ToLower().Contains(value)
                                    || a.ScheduleMaster.UserInformation.FirstName.ToLower().Equals(value))
                                    && a.PatientId == userId && a.Status == status).OrderByDescending(a => a.ScheduleDetail.FromTime)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("DentistLastName"))
            {
                value = value.ToLower();
                var records = db.Appointments.Where(a => (a.ScheduleMaster.UserInformation.LastName.ToLower().Contains(value)
                                                          || a.ScheduleMaster.UserInformation.LastName.ToLower().Equals(value))
                                                          && a.PatientId == userId && a.Status == status)
                                             .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0)
                        .Where(a => (a.ScheduleMaster.UserInformation.LastName.ToLower().Contains(value)
                                    || a.ScheduleMaster.UserInformation.LastName.ToLower().Equals(value))
                                    && a.PatientId == userId && a.Status == status).OrderByDescending(a => a.ScheduleDetail.FromTime)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("DentistMiddleName"))
            {
                value = value.ToLower();
                var records = db.Appointments.Where(a => (a.ScheduleMaster.UserInformation.MiddleName.ToLower().Contains(value)
                                                          || a.ScheduleMaster.UserInformation.MiddleName.ToLower().Equals(value))
                                                          && a.PatientId == userId && a.Status == status)
                                             .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0)
                        .Where(a => (a.ScheduleMaster.UserInformation.MiddleName.ToLower().Contains(value)
                                    || a.ScheduleMaster.UserInformation.MiddleName.ToLower().Equals(value))
                                    && a.PatientId == userId && a.Status == status).OrderByDescending(a => a.ScheduleDetail.FromTime)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            //status
            else
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Integer");
                var records = db.Appointments.Where(a => a.Status == strManipulate.intValue && a.PatientId == userId && a.Status == status)
                                             .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (db.PatientDiagnosisHistoryMasters.Where(pdh => pdh.AppointmentId == a.Id && pdh.Status == 1).Count()) == 0)
                        .Where(a => a.Status == strManipulate.intValue && a.PatientId == userId && a.Status == status).OrderBy(a => a.Status)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
        }

        //Filtering for All Appointments
        public void filterRecord(int length, int userId, string property, string value, string value2, ref Appointment[] appointments)
        {
            /* Fields that can be filter
             * Transaction Date
             * Patient First Name
             * Patient Middle Name
             * Patient Last Name
             * Dentist First Name
             * Dentist Middle Name
             * Dentist Last Name
             * Scheduled Date
             * Scheduled From Time
             * Scheduled To Time
             * Status
             */
            //Filter for a specific patient
            int fetch;
            appointments = null;
            if (property.Equals("TransactionDate"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Date");
                strManipulate.dateValue2 = strManipulate.dateValue2.AddHours(11);
                var records = db.Appointments.Where(a => (a.TransactionDate >= strManipulate.dateValue && a.TransactionDate <= strManipulate.dateValue2)
                                                            && a.PatientId == userId && a.Status != 3).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (a.TransactionDate >= strManipulate.dateValue && a.TransactionDate <= strManipulate.dateValue2)
                                                            && a.PatientId == userId && a.Status != 3).OrderByDescending(a => a.TransactionDate)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("ScheduledDate"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Date");
                var records = db.Appointments.Where(a => (a.ScheduleMaster.Date >= strManipulate.dateValue && a.ScheduleMaster.Date <= strManipulate.dateValue2)
                                                            && a.PatientId == userId && a.Status != 3).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (a.ScheduleMaster.Date >= strManipulate.dateValue && a.ScheduleMaster.Date <= strManipulate.dateValue2)
                                                            && a.PatientId == userId && a.Status != 3).OrderByDescending(a => a.ScheduleMaster.Date)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("ScheduledFromTime"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Time");
                var records = db.Appointments.Where(a => (a.ScheduleDetail.FromTime >= strManipulate.timeValue && a.ScheduleDetail.FromTime <= strManipulate.timeValue2)
                                                            && a.PatientId == userId && a.Status != 3).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (a.ScheduleDetail.FromTime >= strManipulate.timeValue && a.ScheduleDetail.FromTime <= strManipulate.timeValue2)
                                    && a.PatientId == userId && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime).Skip((length)).Take(fetch).ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("ScheduledToTime"))
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Time");
                var records = db.Appointments.Where(a => (a.ScheduleDetail.ToTime >= strManipulate.timeValue && a.ScheduleDetail.ToTime <= strManipulate.timeValue2)
                                                          && a.PatientId == userId && a.Status != 3).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (a.ScheduleDetail.ToTime >= strManipulate.timeValue && a.ScheduleDetail.ToTime <= strManipulate.timeValue2)
                                    && a.PatientId == userId && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("DentistFirstName"))
            {
                value = value.ToLower();
                var records = db.Appointments.Where(a => (a.ScheduleMaster.UserInformation.FirstName.ToLower().Contains(value)
                                                          || a.ScheduleMaster.UserInformation.FirstName.ToLower().Equals(value))
                                                          && a.PatientId == userId && a.Status != 3).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (a.ScheduleMaster.UserInformation.FirstName.ToLower().Contains(value)
                                    || a.ScheduleMaster.UserInformation.FirstName.ToLower().Equals(value))
                                    && a.PatientId == userId && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("DentistLastName"))
            {
                value = value.ToLower();
                var records = db.Appointments.Where(a => (a.ScheduleMaster.UserInformation.LastName.ToLower().Contains(value)
                                                          || a.ScheduleMaster.UserInformation.LastName.ToLower().Equals(value))
                                                          && a.PatientId == userId && a.Status != 3).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (a.ScheduleMaster.UserInformation.LastName.ToLower().Contains(value)
                                    || a.ScheduleMaster.UserInformation.LastName.ToLower().Equals(value))
                                    && a.PatientId == userId && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("DentistMiddleName"))
            {
                value = value.ToLower();
                var records = db.Appointments.Where(a => (a.ScheduleMaster.UserInformation.MiddleName.ToLower().Contains(value)
                                                          || a.ScheduleMaster.UserInformation.MiddleName.ToLower().Equals(value))
                                                          && a.PatientId == userId && a.Status != 3).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => (a.ScheduleMaster.UserInformation.MiddleName.ToLower().Contains(value)
                                    || a.ScheduleMaster.UserInformation.MiddleName.ToLower().Equals(value))
                                    && a.PatientId == userId && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
            //status
            else
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Integer");
                var records = db.Appointments.Where(a => a.Status == strManipulate.intValue && a.PatientId == userId && a.Status != 3).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getAppointments = db.Appointments
                        .Include(a => a.ScheduleMaster)
                        .Include(a => a.ScheduleDetail)
                        .Include(a => a.ScheduleMaster.UserInformation)
                        .Where(a => a.Status == strManipulate.intValue && a.PatientId == userId && a.Status != 3).OrderBy(a => a.Status)
                        .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                    appointments = getAppointments;
                }
            }
        }
        //Filtering for Special Appointments
        public void filterRecord(int length, string type, string property, string value, string value2, ref Appointment[] appointments)
        {
            /* Fields that can be filter
             * Transaction Date
             * Patient First Name
             * Patient Middle Name
             * Patient Last Name
             * Dentist First Name
             * Dentist Middle Name
             * Dentist Last Name
             * Scheduled Date
             * Scheduled From Time
             * Scheduled To Time
             * Status
             */
            //Filter for a specific patient
            int fetch;
            appointments = null;
            if (type.Equals("special"))
            {
                if (property.Equals("TransactionDate"))
                {
                    StringManipulation strManipulate = new StringManipulation(value, value2, "Date");
                    strManipulate.dateValue2 = strManipulate.dateValue2.AddHours(24);
                    var records = db.Appointments.Where(a => (a.TransactionDate >= strManipulate.dateValue && a.TransactionDate <= strManipulate.dateValue2)
                                                              && a.Type.Equals("SpecialAppointment") && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.TransactionDate >= strManipulate.dateValue && a.TransactionDate <= strManipulate.dateValue2)
                                         && a.Type.Equals("SpecialAppointment") && a.Status != 3).OrderByDescending(a => a.TransactionDate)
                            .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("ScheduledDate"))
                {
                    StringManipulation strManipulate = new StringManipulation(value, value2, "Date");
                    var records = db.Appointments.Where(a => (a.ScheduleMaster.Date >= strManipulate.dateValue && a.ScheduleMaster.Date <= strManipulate.dateValue2)
                                                              && a.Type.Equals("SpecialAppointment") && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.ScheduleMaster.Date >= strManipulate.dateValue && a.ScheduleMaster.Date <= strManipulate.dateValue2)
                                         && a.Type.Equals("SpecialAppointment") && a.Status != 3).OrderByDescending(a => a.ScheduleMaster.Date)
                            .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("ScheduledFromTime"))
                {
                    StringManipulation strManipulate = new StringManipulation(value, value2, "Time");
                    var records = db.Appointments.Where(a => (a.ScheduleDetail.FromTime >= strManipulate.timeValue && a.ScheduleDetail.FromTime <= strManipulate.timeValue2)
                                  && a.Type.Equals("SpecialAppointment") && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.ScheduleDetail.FromTime >= strManipulate.timeValue && a.ScheduleDetail.FromTime <= strManipulate.timeValue2)
                                        && a.Type.Equals("SpecialAppointment") && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime)
                            .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("ScheduledToTime"))
                {
                    StringManipulation strManipulate = new StringManipulation(value, value2, "Time");
                    var records = db.Appointments.Where(a => (a.ScheduleDetail.ToTime >= strManipulate.timeValue && a.ScheduleDetail.ToTime <= strManipulate.timeValue2)
                                                              && a.Type.Equals("SpecialAppointment") && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.ScheduleDetail.ToTime >= strManipulate.timeValue && a.ScheduleDetail.ToTime <= strManipulate.timeValue2)
                                        && a.Type.Equals("SpecialAppointment") && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime)
                            .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("PatientFirstName"))
                {
                    value = value.ToLower();
                    var records = db.Appointments
                                    .Where(a => ((a.User.UserInformations.Where(ui => ui.FirstName.ToLower().Contains(value)).Count()) > 0
                                                || (a.User.UserInformations.Where(ui => ui.FirstName.ToLower().Equals(value)).Count()) > 0)
                                                && a.Type.Equals("SpecialAppointment") && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.User.UserInformations.Where(ui => ui.FirstName.ToLower().Contains(value)).Count() > 0
                                        || a.User.UserInformations.Where(ui => ui.FirstName.ToLower().Equals(value)).Count() > 0)
                                        && a.Type.Equals("SpecialAppointment") && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime)
                            .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("PatientMiddleName"))
                {
                    value = value.ToLower();
                    var records = db.Appointments.Where(a => (a.User.UserInformations.Where(ui => ui.MiddleName.ToLower().Contains(value)).Count() > 0
                                                            || a.User.UserInformations.Where(ui => ui.MiddleName.ToLower().Equals(value)).Count() > 0)
                                                            && a.Type.Equals("SpecialAppointment") && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.User.UserInformations.Where(ui => ui.MiddleName.ToLower().Contains(value)).Count() > 0
                                        || a.User.UserInformations.Where(ui => ui.MiddleName.ToLower().Equals(value)).Count() > 0)
                                        && a.Type.Equals("SpecialAppointment") && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime)
                            .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("PatientLastName"))
                {
                    value = value.ToLower();
                    var records = db.Appointments.Where(a => (a.User.UserInformations.Where(ui => ui.LastName.ToLower().Contains(value)).Count() > 0
                                                              || a.User.UserInformations.Where(ui => ui.LastName.ToLower().Equals(value)).Count() > 0)
                                                              && a.Type.Equals("SpecialAppointment") && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.User.UserInformations.Where(ui => ui.LastName.ToLower().Contains(value)).Count() > 0
                                        || a.User.UserInformations.Where(ui => ui.LastName.ToLower().Equals(value)).Count() > 0)
                                        && a.Type.Equals("SpecialAppointment") && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime)
                            .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("DentistFirstName"))
                {
                    value = value.ToLower();
                    var records = db.Appointments.Where(a => (a.ScheduleMaster.UserInformation.FirstName.ToLower().Contains(value)
                                                              || a.ScheduleMaster.UserInformation.FirstName.ToLower().Equals(value))
                                                              && a.Type.Equals("SpecialAppointment") && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.ScheduleMaster.UserInformation.FirstName.ToLower().Contains(value)
                                        || a.ScheduleMaster.UserInformation.FirstName.ToLower().Equals(value))
                                        && a.Type.Equals("SpecialAppointment") && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime)
                            .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("DentistLastName"))
                {
                    value = value.ToLower();
                    var records = db.Appointments.Where(a => (a.ScheduleMaster.UserInformation.LastName.ToLower().Contains(value)
                                                              || a.ScheduleMaster.UserInformation.LastName.ToLower().Equals(value))
                                                              && a.Type.Equals("SpecialAppointment") && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.ScheduleMaster.UserInformation.LastName.ToLower().Contains(value)
                                        || a.ScheduleMaster.UserInformation.LastName.ToLower().Equals(value))
                                        && a.Type.Equals("SpecialAppointment") && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime)
                            .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("DentistMiddleName"))
                {
                    value = value.ToLower();
                    var records = db.Appointments.Where(a => (a.ScheduleMaster.UserInformation.MiddleName.ToLower().Contains(value)
                                                              || a.ScheduleMaster.UserInformation.MiddleName.ToLower().Equals(value))
                                                              && a.Type.Equals("SpecialAppointment") && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.ScheduleMaster.UserInformation.MiddleName.ToLower().Contains(value)
                                        || a.ScheduleMaster.UserInformation.MiddleName.ToLower().Equals(value))
                                        && a.Type.Equals("SpecialAppointment") && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime)
                            .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                //status
                else
                {
                    StringManipulation strManipulate = new StringManipulation(value, value2, "Integer");
                    var records = db.Appointments.Where(a => a.Status == strManipulate.intValue && a.Status != 3 && a.Type.Equals("SpecialAppointment")).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => a.Status == strManipulate.intValue && a.Status != 3 && a.Type.Equals("SpecialAppointment")).OrderBy(a => a.Status)
                            .Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
            }
            //All appointments
            else
            {
                if (property.Equals("TransactionDate"))
                {
                    StringManipulation strManipulate = new StringManipulation(value, value2, "Date");
                    strManipulate.dateValue2 = strManipulate.dateValue2.AddHours(24);
                    var records = db.Appointments.Where(a => (a.TransactionDate >= strManipulate.dateValue && a.TransactionDate <= strManipulate.dateValue2)
                                                              && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.TransactionDate >= strManipulate.dateValue && a.TransactionDate <= strManipulate.dateValue2)
                                         && a.Status != 3).OrderByDescending(a => a.TransactionDate).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("ScheduledDate"))
                {
                    StringManipulation strManipulate = new StringManipulation(value, value2, "Date");
                    var records = db.Appointments.Where(a => (a.ScheduleMaster.Date >= strManipulate.dateValue && a.ScheduleMaster.Date <= strManipulate.dateValue2)
                                                              && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.ScheduleMaster.Date >= strManipulate.dateValue && a.ScheduleMaster.Date <= strManipulate.dateValue2)
                                         && a.Status != 3).OrderByDescending(a => a.ScheduleMaster.Date).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("ScheduledFromTime"))
                {
                    StringManipulation strManipulate = new StringManipulation(value, value2, "Time");
                    var records = db.Appointments.Where(a => (a.ScheduleDetail.FromTime >= strManipulate.timeValue && a.ScheduleDetail.FromTime <= strManipulate.timeValue2)
                                  && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.ScheduleDetail.FromTime >= strManipulate.timeValue && a.ScheduleDetail.FromTime <= strManipulate.timeValue2)
                                        && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("ScheduledToTime"))
                {
                    StringManipulation strManipulate = new StringManipulation(value, value2, "Time");
                    var records = db.Appointments.Where(a => (a.ScheduleDetail.ToTime >= strManipulate.timeValue && a.ScheduleDetail.ToTime <= strManipulate.timeValue2)
                                                              && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.ScheduleDetail.ToTime >= strManipulate.timeValue && a.ScheduleDetail.ToTime <= strManipulate.timeValue2)
                                        && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("PatientFirstName"))
                {
                    value = value.ToLower();
                    var records = db.Appointments
                                    .Where(a => ((a.User.UserInformations.Where(ui => ui.FirstName.ToLower().Contains(value)).Count()) > 0
                                                || (a.User.UserInformations.Where(ui => ui.FirstName.ToLower().Equals(value)).Count()) > 0)
                                                && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.User.UserInformations.Where(ui => ui.FirstName.ToLower().Contains(value)).Count() > 0
                                        || a.User.UserInformations.Where(ui => ui.FirstName.ToLower().Equals(value)).Count() > 0)
                                        && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("PatientMiddleName"))
                {
                    value = value.ToLower();
                    var records = db.Appointments.Where(a => (a.User.UserInformations.Where(ui => ui.MiddleName.ToLower().Contains(value)).Count() > 0
                                                            || a.User.UserInformations.Where(ui => ui.MiddleName.ToLower().Equals(value)).Count() > 0)
                                                            && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.User.UserInformations.Where(ui => ui.MiddleName.ToLower().Contains(value)).Count() > 0
                                        || a.User.UserInformations.Where(ui => ui.MiddleName.ToLower().Equals(value)).Count() > 0)
                                        && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("PatientLastName"))
                {
                    value = value.ToLower();
                    var records = db.Appointments.Where(a => (a.User.UserInformations.Where(ui => ui.LastName.ToLower().Contains(value)).Count() > 0
                                                              || a.User.UserInformations.Where(ui => ui.LastName.ToLower().Equals(value)).Count() > 0)
                                                              && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.User.UserInformations.Where(ui => ui.LastName.ToLower().Contains(value)).Count() > 0
                                        || a.User.UserInformations.Where(ui => ui.LastName.ToLower().Equals(value)).Count() > 0)
                                        && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("DentistFirstName"))
                {
                    value = value.ToLower();
                    var records = db.Appointments.Where(a => (a.ScheduleMaster.UserInformation.FirstName.ToLower().Contains(value)
                                                              || a.ScheduleMaster.UserInformation.FirstName.ToLower().Equals(value))
                                                              && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.ScheduleMaster.UserInformation.FirstName.ToLower().Contains(value)
                                        || a.ScheduleMaster.UserInformation.FirstName.ToLower().Equals(value))
                                        && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("DentistLastName"))
                {
                    value = value.ToLower();
                    var records = db.Appointments.Where(a => (a.ScheduleMaster.UserInformation.LastName.ToLower().Contains(value)
                                                              || a.ScheduleMaster.UserInformation.LastName.ToLower().Equals(value))
                                                              && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.ScheduleMaster.UserInformation.LastName.ToLower().Contains(value)
                                        || a.ScheduleMaster.UserInformation.LastName.ToLower().Equals(value))
                                        && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                else if (property.Equals("DentistMiddleName"))
                {
                    value = value.ToLower();
                    var records = db.Appointments.Where(a => (a.ScheduleMaster.UserInformation.MiddleName.ToLower().Contains(value)
                                                              || a.ScheduleMaster.UserInformation.MiddleName.ToLower().Equals(value))
                                                              && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => (a.ScheduleMaster.UserInformation.MiddleName.ToLower().Contains(value)
                                        || a.ScheduleMaster.UserInformation.MiddleName.ToLower().Equals(value))
                                        && a.Status != 3).OrderByDescending(a => a.ScheduleDetail.FromTime).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
                //status
                else
                {
                    StringManipulation strManipulate = new StringManipulation(value, value2, "Integer");
                    var records = db.Appointments.Where(a => a.Status == strManipulate.intValue && a.Status != 3).Count();
                    if (records > length)
                    {
                        if ((records - length) > pageSize)
                            fetch = pageSize;
                        else
                            fetch = records - length;
                        var getAppointments = db.Appointments
                            .Include(a => a.User.UserInformations)
                            .Include(a => a.ScheduleMaster)
                            .Include(a => a.ScheduleDetail)
                            .Include(a => a.ScheduleMaster.UserInformation)
                            .Where(a => a.Status == strManipulate.intValue && a.Status != 3).OrderBy(a => a.Status).Skip((length)).Take(fetch).AsNoTracking().ToArray();
                        appointments = getAppointments;
                    }
                }
            }
        }

        //Filtering for reports
        public void filterRecord(int length, Appointment appointment, Appointment appointment1, ref Appointment[] appointments)
        {
            appointments = null;
            ////Set default values
            DateTime defaultDate = new DateTime(0001, 01, 01, 00, 00, 00); 

            var appointmentList = db.Appointments
                                    .Include(a => a.User.UserInformations)
                                    .Include(a => a.ScheduleMaster)
                                    .Include(a => a.ScheduleDetail)
                                    .Include(a => a.ScheduleMaster.UserInformation)
                                    .Where(a => appointment.TransactionDate == null ? true : a.TransactionDate >= appointment.TransactionDate && a.TransactionDate <= appointment1.TransactionDate)
                                    .Where(a => appointment.PatientId == null || appointment.PatientId == 0 ? true :  a.PatientId == appointment.PatientId)
                                    .Where(a => appointment.Status == null || appointment.Status == 2147483647 ? true : a.Status == appointment.Status)
                                    .Where(a => appointment.ScheduleMaster.DentistId == null || appointment.ScheduleMaster.DentistId == 0 ? true : a.ScheduleMaster.DentistId == appointment.ScheduleMaster.DentistId)
                                    .Where(a => appointment.ScheduleMaster.Date == defaultDate ? true : a.ScheduleMaster.Date >= appointment.ScheduleMaster.Date && a.ScheduleMaster.Date <= appointment1.ScheduleMaster.Date)
                                    .OrderByDescending(a => a.ScheduleMaster.Date)
                                    .Skip(length).Take(pageSize).AsNoTracking().ToArray();
            appointments = appointmentList;
        }
    }
}