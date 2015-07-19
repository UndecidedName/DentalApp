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

        public IQueryable<Appointment> GetAppointment(int length, int userId)
        {
            int fetch;
            var records = db.Appointments.Where(a => a.PatientId == userId && a.Status != 3).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.Appointments
                    .Where(a => a.PatientId == userId && a.Status != 3)
                    .Include(a => a.ScheduleMaster)
                    .Include(a => a.ScheduleDetail)
                    .Include(a => a.ScheduleMaster.UserInformation)
                    .OrderBy(a => a.ScheduleMaster.Date).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<Appointment> a = new List<Appointment>().AsQueryable();
                return a;
            }
        }
        // GET: api/Appointments?length=0&type=appointments
        public IQueryable<Appointment> GetAppointment(int length, String type)
        {
            int fetch;
            var records = db.Appointments.Where(a => a.Status != 3).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.Appointments
                    .Where(a => a.Status != 3)
                    .Include(a => a.User.UserInformations)
                    .Include(a => a.ScheduleMaster)
                    .Include(a => a.ScheduleDetail)
                    .Include(a => a.ScheduleMaster.UserInformation)
                    .OrderBy(a => a.ScheduleMaster.Date).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<Appointment> a = new List<Appointment>().AsQueryable();
                return a;
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

                if (appointment.Status == 2)
                {
                    //open schedule detail and schedule master status if appointment is disapproved
                    ScheduleDetail.updateScheduleDetailStatus((int)appointment.ScheduleDetailId, 0);
                    ScheduleMaster.updateScheduleMasterStatus((int)appointment.ScheduleMasterId, ref scheduleMasterStatus);
                }
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = appointment;
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
            try
            {
                if (appointment.Status == 0 || appointment.Status == 2)
                {
                    //cancel appointment status
                    updateAppointmentStatus(id, 3);
                    //open schedule detail status
                    ScheduleDetail.updateScheduleDetailStatus((int)appointment.ScheduleDetailId, 0);
                    //update schedule master status
                    ScheduleMaster.updateScheduleMasterStatus((int)appointment.ScheduleMasterId, ref scheduleMasterStatus);
                    response.status = "SUCCESS";
                }
                else {
                    response.message = "You cannot delete approved appointments.";
                }
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