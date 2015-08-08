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
using YbanezNacua.Models;

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
                    .Include(a => a.ScheduleMaster)
                    .Include(a => a.ScheduleDetail)
                    .Include(a => a.ScheduleMaster.UserInformation)
                    .Where(a => a.PatientId == userId && a.Status != 3).OrderByDescending(a => a.ScheduleMaster.Date).Skip((length)).Take(fetch).ToArray();
                appointments[0].Message = null;
                appointments[0].User = null;
                appointments[0].PatientDiagnosisHistoryMasters = null;
                appointments[0].ScheduleMaster.Appointments = null;
                appointments[0].ScheduleMaster.ScheduleDetails = null;
                appointments[0].ScheduleDetail.Appointments = null;
                appointments[0].ScheduleDetail.ScheduleMaster = null;
                appointments[0].ScheduleMaster.UserInformation.PatientMouths = null;
                appointments[0].ScheduleMaster.UserInformation.ScheduleMasters = null;
                appointments[0].ScheduleMaster.UserInformation.User = null;

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
                        .Where(a => a.Status != 3).OrderByDescending(a => a.ScheduleMaster.Date).Skip((length)).Take(fetch).ToArray();
                    appointments[0].User.Appointments = null;
                    appointments[0].User.Messages = null;
                    appointments[0].User.Messages1 = null;
                    appointments[0].User.Notifications = null;
                    appointments[0].User.PatientDentalHistories = null;
                    appointments[0].User.PatientDiagnosisHistoryMasters = null;
                    appointments[0].User.PatientMedicalHistories = null;
                    appointments[0].User.UserType = null;
                    appointments[0].PatientDiagnosisHistoryMasters = null;
                    appointments[0].ScheduleMaster.Appointments = null;
                    appointments[0].ScheduleMaster.ScheduleDetails = null;
                    appointments[0].ScheduleDetail.Appointments = null;
                    appointments[0].ScheduleDetail.ScheduleMaster = null;
                    appointments[0].ScheduleMaster.UserInformation.PatientMouths = null;
                    appointments[0].ScheduleMaster.UserInformation.ScheduleMasters = null;
                    appointments[0].ScheduleMaster.UserInformation.CivilStatu = null;
                    appointments[0].ScheduleMaster.UserInformation.User = null;
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
                        .Where(a => a.Status != 3).OrderByDescending(a => a.ScheduleMaster.Date).Skip((length)).Take(fetch).ToArray();
                    appointments[0].User.Appointments = null;
                    appointments[0].User.Messages = null;
                    appointments[0].User.Messages1 = null;
                    appointments[0].User.Notifications = null;
                    appointments[0].User.PatientDentalHistories = null;
                    appointments[0].User.PatientDiagnosisHistoryMasters = null;
                    appointments[0].User.PatientMedicalHistories = null;
                    appointments[0].User.UserType = null;
                    appointments[0].PatientDiagnosisHistoryMasters = null;
                    appointments[0].ScheduleMaster.Appointments = null;
                    appointments[0].ScheduleMaster.ScheduleDetails = null;
                    appointments[0].ScheduleDetail.Appointments = null;
                    appointments[0].ScheduleDetail.ScheduleMaster = null;
                    appointments[0].ScheduleMaster.UserInformation.PatientMouths = null;
                    appointments[0].ScheduleMaster.UserInformation.ScheduleMasters = null;
                    appointments[0].ScheduleMaster.UserInformation.CivilStatu = null;
                    appointments[0].ScheduleMaster.UserInformation.User = null;
                    return Ok(appointments);
                }
                else
                {
                    return Ok();
                }
            }
        }

        public IHttpActionResult GetAppointment(int length, int userId, string property, string value)
        {
            Appointment []  appointments = new Appointment[pageSize];
            this.filterRecord(length, userId, property, value, ref appointments);
            return Ok(appointments);
        }
       // GET: /api/Appointments?length=0&userid=4&property=TransactionDate&value=08-02-2015
        public void filterRecord(int length, int userId, string property, string value, ref Appointment [] appointments)
        {
            /* Fields that can be filter
             * TransactionDate
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
                StringManipulation strManipulate = new StringManipulation(value, "Date");
                var records = db.Appointments.Where(a => a.TransactionDate >= strManipulate.dateValue && a.PatientId == userId).Count();
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
                        .Where(a => a.TransactionDate >= strManipulate.dateValue && a.PatientId == userId).OrderByDescending(a => a.TransactionDate).Skip((length)).Take(fetch).ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("ScheduledDate"))
            {
                StringManipulation strManipulate = new StringManipulation(value, "Date");
                var records = db.Appointments.Where(a => a.ScheduleMaster.Date == strManipulate.dateValue && a.PatientId == userId).Count();
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
                        .Where(a => a.ScheduleMaster.Date == strManipulate.dateValue && a.PatientId == userId).OrderByDescending(a => a.ScheduleMaster.Date).Skip((length)).Take(fetch).ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("ScheduledFromTime"))
            {
                StringManipulation strManipulate = new StringManipulation(value, "Time");
                var records = db.Appointments.Where(a => a.ScheduleDetail.FromTime == strManipulate.timeValue && a.PatientId == userId).Count();
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
                        .Where(a => a.ScheduleDetail.FromTime == strManipulate.timeValue && a.PatientId == userId).OrderByDescending(a => a.ScheduleDetail.FromTime).Skip((length)).Take(fetch).ToArray();
                    appointments = getAppointments;
                }
            }
            else if (property.Equals("ScheduledToTime"))
            {
                StringManipulation strManipulate = new StringManipulation(value, "Time");
                var records = db.Appointments.Where(a => a.ScheduleDetail.ToTime == strManipulate.timeValue && a.PatientId == userId).Count();
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
                        .Where(a => a.ScheduleDetail.ToTime == strManipulate.timeValue && a.PatientId == userId).OrderByDescending(a => a.ScheduleDetail.FromTime).Skip((length)).Take(fetch).ToArray();
                    appointments = getAppointments;
                }
            }
            //status
            else
            {
                StringManipulation strManipulate = new StringManipulation(value, "Integer");
                var records = db.Appointments.Where(a => a.Status == strManipulate.intValue && a.PatientId == userId).Count();
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
                        .Where(a => a.Status == strManipulate.intValue && a.PatientId == userId).OrderBy(a => a.Status).Skip((length)).Take(fetch).ToArray();
                    appointments = getAppointments;
                }
            }
            for (int i = 0; i < appointments.Length; i++)
            {
                appointments[i].Message = null;
                appointments[i].User = null;
                appointments[i].PatientDiagnosisHistoryMasters = null;
                appointments[i].ScheduleMaster.Appointments = null;
                appointments[i].ScheduleMaster.ScheduleDetails = null;
                appointments[i].ScheduleDetail.Appointments = null;
                appointments[i].ScheduleDetail.ScheduleMaster = null;
                appointments[i].ScheduleMaster.UserInformation.PatientMouths = null;
                appointments[i].ScheduleMaster.UserInformation.ScheduleMasters = null;
                appointments[i].ScheduleMaster.UserInformation.User = null;
            }
            
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
    }
}