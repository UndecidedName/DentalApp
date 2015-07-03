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
using System.Web;
using System.Text.RegularExpressions;

namespace DentalApplicationV1.APIController
{
    public class UsersController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        string header, body, footer;
        Response response = new Response();
        MyGenerator generator = new MyGenerator();

        // GET: api/Users
        public IQueryable<User> GetUsers()
        {
            return db.Users;
        }

        // GET: api/Users?userinfo&request=something
        [ResponseType(typeof(User))]
        public IHttpActionResult GetUser(string userinfo, string request)
        {
            var Session = HttpContext.Current.Session;
            string username = "", password = "";
            response.status = "FAILURE";

            if (!(request.Equals("logout") || request.Equals("CheckIfLogged")))
            { 
                String [] userinformation = userinfo.Split(',');
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
            else
                return Ok(response);
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