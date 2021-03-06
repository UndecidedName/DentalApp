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
    public class NotificationsController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private Response response = new Response();
        private int pageSize = 20;
        // GET: api/Notifications
        public IQueryable<Notification> GetNotifications()
        {
            return db.Notifications;
        }

        // GET: api/Notifications?userid=0&length=20
        public IQueryable<Notification> GetNotifications(int userId, int length)
        {
            int fetch;
            var records = db.Notifications.Where(n => n.UserId == userId).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;
                return db.Notifications
                    .Where(n => n.UserId == userId)
                    .OrderBy(n => n.Status)
                    .Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<Notification> n = new List<Notification>().AsQueryable();
                return n;
            }
        }
 
        // GET: api/Notifications?status=0&userId=1
        //returns the number of unread notifications
        public IHttpActionResult GetNotifications(int status, int userId, string dummy) {
            response.status = "SUCCESS";
            response.intParam1 = db.Notifications.Where(n => n.Status == status && n.UserId == userId).Count();
            return Ok(response);
        }

        // GET: api/Notifications/5
        [ResponseType(typeof(Notification))]
        public IHttpActionResult GetNotification(int id)
        {
            Notification notification = db.Notifications.Find(id);
            if (notification == null)
            {
                return NotFound();
            }

            return Ok(notification);
        }

        // PUT: api/Notifications/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutNotification(int id, Notification notification)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid || id != notification.Id)
            {
                response.message = "Bad request.";
                return Ok(response);
            }

            db.Entry(notification).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = notification;
            }
            catch (Exception e)
            {
                if (!NotificationExists(id))
                {
                    response.message = "Notification doesn't exist.";
                }
                else
                {
                    response.message = e.InnerException.InnerException.Message.ToString();
                }
            }

            return Ok(response);
        }

        // POST: api/Notifications
        [ResponseType(typeof(Notification))]
        public IHttpActionResult PostNotification(Notification notification)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }
            try
            {
                db.Notifications.Add(notification);
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = notification;
            }
            catch (Exception e)
            {
                response.message = e.InnerException.InnerException.Message.ToString();
            }

            return Ok(response);
        }

        // DELETE: api/Notifications/5
        [ResponseType(typeof(Notification))]
        public IHttpActionResult DeleteNotification(int id)
        {
            Notification notification = db.Notifications.Find(id);
            if (notification == null)
            {
                return NotFound();
            }

            db.Notifications.Remove(notification);
            db.SaveChanges();

            return Ok(notification);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool NotificationExists(int id)
        {
            return db.Notifications.Count(e => e.Id == id) > 0;
        }
    }
}