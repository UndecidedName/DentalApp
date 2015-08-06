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
using System.Web;
using System.Text.RegularExpressions;

namespace DentalApplicationV1.APIController
{
    public class UsersController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private Response response = new Response();
        private MyGenerator generator = new MyGenerator();

        // GET: api/Users
        public IQueryable<User> GetUsers()
        {
            return db.Users;
        }

        public HttpResponseMessage GetUsers(string url, string username)
        {
            try
            {
                var Session = HttpContext.Current.Session;
                var rootUrl = Url.Content("~/");
                var redirect = Request.CreateResponse(HttpStatusCode.Moved);

                //Search username and get url
                var users = db.Users.Where(u => u.Username.Equals(username)).ToArray();
                if (users.Length > 0 && users[0].Url.Equals(url))
                {
                    var user = db.Users.Find(users[0].Id);
                    users[0].Status = 1;
                    db.Entry(user).State = EntityState.Modified;
                    db.Entry(user).CurrentValues.SetValues(users[0]);
                    db.SaveChanges();
                    Session["Username"] = username;
                    redirect.Headers.Location = new Uri(rootUrl + "#/Home/Index");
                }
                else
                    redirect.Headers.Location = new Uri(rootUrl + "Home/NotFound");
                return redirect;
            }catch(Exception){
                 throw;
            }
        }
        // GET: api/Users?userinfo&request=something
        [ResponseType(typeof(User))]
        public IHttpActionResult GetUser(string userinfo, string request)
        {
            var Session = HttpContext.Current.Session;
            string username = "", password = "";
            response.status = "FAILURE";

            //get all users which are userType 4 for Dentist and 5 for Secretary
            var getUsersForNotification = db.Users.Where(u => u.UserTypeId == 4 || u.UserTypeId == 5).ToArray();
            getUsersForNotification[0].Appointments = null;
            getUsersForNotification[0].Messages = null;
            getUsersForNotification[0].Messages1 = null;
            getUsersForNotification[0].Notifications = null;
            getUsersForNotification[0].PatientDentalHistories = null;
            getUsersForNotification[0].PatientDiagnosisHistoryMasters = null;
            getUsersForNotification[0].PatientMedicalHistories = null;
            getUsersForNotification[0].UserType = null;
            getUsersForNotification[0].UserInformations = null;
            response.objParam2 = getUsersForNotification;

            if (!(request.Equals("logout") || request.Equals("CheckIfLogged")))
            {
                String[] userinformation = userinfo.Split(',');
                username = userinformation[0];
                password = userinformation[1];
            }

            if (request.Equals("login"))
            {
                //exclude html tag
                //username = Regex.Replace(username, @"<[^>]+>|&nbsp;", "").Trim();
                var searchUser = db.V_UsersList.Where(u => u.Username.Equals(username)).ToList();
                //Check if user exist
                if (searchUser.Count() == 0)
                {
                    response.message = "User not found!";
                    return Ok(response);
                }
                else
                {
                    foreach (var data in searchUser)
                    {
                        //Check if password is correct
                        if (!(data.Password.Equals(password)))
                        {
                            response.message = "Incorrect password, please try again!";
                            return Ok(response);
                        }
                    }
                    if (searchUser[0].Status == 1)
                    {
                        //create session username
                        if (Session != null)
                            Session["Username"] = username;
                    }
                    else
                    {
                        response.message = "Please check your email for account activation.";
                        return Ok(response);
                    }
                    //searchUser.Username = generator.Decrypt(searchUser.Username);
                    //searchUser.Password = generator.Decrypt(searchUser.Password);
                    response.status = "SUCCESS";
                    response.param1 = Session["Username"].ToString();
                    response.objParam1 = searchUser;
                    //Include UserMenu
                    return Ok(response);
                }
            }
            else if (request.Equals("CheckIfLogged"))
            {
                if (Session != null)
                {
                    if (Session["Username"] != null)
                    {
                        String usernameHolder = Session["Username"].ToString();
                        var searchUser = db.V_UsersList.Where(u => u.Username.Equals(usernameHolder)).ToList();
                        response.status = "SUCCESS";
                        response.objParam1 = searchUser;
                    }
                }
                return Ok(response);
            }
            //logout
            else if (request.Equals("logout"))
            {
                Session.Remove("Username");
                response.status = "SUCCESS";
                return Ok(response);
            }
            //notification
            else
            {
                return Ok(response);
            }
        }

        // GET: api/Users/5
        [ResponseType(typeof(User))]
        public IHttpActionResult GetUser(int id)
        {
            response.status = "FAILURE";
            User user = db.Users.Find(id);
            if (user == null)
                response.message = "User doesn't exist!";
            else
            {
                response.status = "SUCCESS";
                response.objParam1 = user;
            }
            return Ok(response);
        }

        // PUT: api/Users/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutUser(int id, User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != user.Id)
            {
                return BadRequest();
            }

            db.Entry(user).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Users
        [ResponseType(typeof(User))]
        public IHttpActionResult PostUser(User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Users.Add(user);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = user.Id }, user);
        }

        // DELETE: api/Users/5
        [ResponseType(typeof(User))]
        public IHttpActionResult DeleteUser(int id)
        {
            User user = db.Users.Find(id);
            if (user == null)
            {
                return NotFound();
            }

            db.Users.Remove(user);
            db.SaveChanges();

            return Ok(user);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserExists(int id)
        {
            return db.Users.Count(e => e.Id == id) > 0;
        }
    }
}