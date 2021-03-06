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
    public class UserTypesController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private Response response = new Response();
        private int pageSize = 20;
        // GET: api/UserTypes
        public IQueryable<UserType> GetUserTypes()
        {
            return db.UserTypes;
        }

        public IQueryable<UserType> GetUserTypes(int length)
        {
            int fetch;
            var records = db.DentalMenus.Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.UserTypes
                    .OrderBy(m => m.Name).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<UserType> ut = new List<UserType>().AsQueryable();
                return ut;
            }
        }

        public IQueryable<UserType> GetUserTypes(int length, int status)
        {
            int fetch;
            var records = db.UserTypes.Where(dm => dm.Status == status).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                return db.UserTypes
                    .Where(dm => dm.Status == status)
                    .OrderBy(m => m.Name).Skip((length)).Take(fetch);
            }
            else
            {
                IQueryable<UserType> ut = new List<UserType>().AsQueryable();
                return ut;
            }
        }

        // GET: api/UserTypes/5
        [ResponseType(typeof(UserType))]
        public IHttpActionResult GetUserType(int id)
        {
            UserType userType = db.UserTypes.Find(id);
            if (userType == null)
            {
                return NotFound();
            }

            return Ok(userType);
        }

        //Filtering
        public IHttpActionResult GetUserType(int length, string property, string value, string value2)
        {
            UserType[] userType = new UserType[pageSize];
            this.filterRecord(length, property, value, value2, ref userType);
            if (userType != null)
                return Ok(userType);
            else
                return Ok();
        }

        // PUT: api/UserTypes/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutUserType(int id, UserType userType)
        {
            response.status = "SUCCESS";
            if (!ModelState.IsValid || id != userType.Id)
            {
                response.message = "Bad request.";
                return Ok(response);
            }

            db.Entry(userType).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = userType;
            }
            catch (Exception e)
            {
                if (!UserTypeExists(id))
                {
                    response.message = "User type doesn't exist.";
                }
                else
                {
                    response.message = e.InnerException.InnerException.Message.ToString();
                }
            }

            return Ok(response);
        }

        // POST: api/UserTypes
        [ResponseType(typeof(UserType))]
        public IHttpActionResult PostUserType(UserType userType)
        {
            response.status = "FAILURE";
            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }
            try
            {
                db.UserTypes.Add(userType);
                db.SaveChanges();
                response.status = "SUCCESS";
                response.objParam1 = userType;
            }
            catch (Exception e) {
                response.message = e.InnerException.InnerException.Message.ToString();
            }

            return Ok(response);
        }

        // DELETE: api/UserTypes/5
        [ResponseType(typeof(UserType))]
        public IHttpActionResult DeleteUserType(int id)
        {
            response.status = "FAILURE";
            UserType userType = db.UserTypes.Find(id);
            if (userType == null)
            {
                response.message = "User Type doesn't exist.";
                return Ok(response);
            }
            try
            {
                db.UserTypes.Remove(userType);
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

        private bool UserTypeExists(int id)
        {
            return db.UserTypes.Count(e => e.Id == id) > 0;
        }

        public void filterRecord(int length, string property, string value, string value2, ref UserType[] userType)
        {
            /* Fields that can be filter
             * Name
             * Desription
             * Status
             */
            //Filter for a specific patient
            int fetch;
            userType = null;
            if (property.Equals("Name"))
            {
                value = value.ToLower();
                var records = db.UserTypes.Where(cs => cs.Name.ToLower().Contains(value) || cs.Name.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserType = db.UserTypes.Where(cs => cs.Name.ToLower().Contains(value) || cs.Name.ToLower().ToLower().Equals(value))
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    userType = getUserType;
                }
            }
            else if (property.Equals("Description"))
            {
                value = value.ToLower();
                var records = db.UserTypes.Where(cs => cs.Description.ToLower().Contains(value) || cs.Description.ToLower().ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserType = db.UserTypes.Where(cs => cs.Description.ToLower().Contains(value) || cs.Description.ToLower().ToLower().Equals(value))
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    userType = getUserType;
                }
            }
            //status
            else
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Integer");
                var records = db.UserTypes.Where(cs => cs.Status == strManipulate.intValue).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserType = db.UserTypes.Where(cs => cs.Status == strManipulate.intValue)
                        .OrderBy(cs => cs.Id).Skip((length)).Take(fetch).ToArray();
                    userType = getUserType;
                }
            }
        }
    }
}