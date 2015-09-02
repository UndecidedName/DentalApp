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
using System.Web;
using System.Text.RegularExpressions;

namespace DentalApplicationV1.APIController
{
    public class UsersController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private int pageSize = 20;
        private Response response = new Response();
        private MyGenerator generator = new MyGenerator();

        // GET: api/Users
        public IQueryable<User> GetUsers()
        {
            return db.Users;
        }
        // GET: api/Users?url=xxx&username=xxxx&app=dental
        public HttpResponseMessage GetUser(string url, string username, string app)
        {
            try
            {
                UserInformation ui = new UserInformation();
                var Session = HttpContext.Current.Session;
                var rootUrl = Url.Content("~/");
                var generatedUrl = rootUrl + "api/Users?url=" + url + "&username=" + username + "&app=dental";
                var redirect = Request.CreateResponse(HttpStatusCode.Moved);

                //Search username and get url
                var users = db.Users.Where(u => u.Username.Equals(username)).ToArray();
                if (users.Length > 0 && users[0].Url.Equals(generatedUrl))
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
        // GET: api/Users?length=0
        public IHttpActionResult GetUser(int length)
        {
            int fetch;
            var records = db.Users.Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;

                var getUser = db.Users
                                .Include(u => u.UserInformations)
                                .Include(u => u.UserType)
                                .OrderBy(u => u.Id).Skip((length)).Take(fetch).ToArray();
                for (int i = 0; i < getUser.Length; i++)
                {
                    getUser[0].UserType.UserMenus = null;
                    getUser[0].UserType.Users = null;
                }
                return Ok(getUser);
            }
            else
            {
                return Ok();
            }
        }
        //Filtering for a specif user's Appointments
        public IHttpActionResult GetUser(int length, string property, string value, string value2)
        {
            User[] users = new User[pageSize];
            this.filterRecord(length, property, value, value2, ref users);
            if (users != null)
                return Ok(users);
            else
                return Ok();
        }
        // PUT: api/Users/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutUser(int id, User user)
        {
            Response response = new Response();
            response.status = "FAILURE";
            if (!ModelState.IsValid || id != user.Id)
            {
                response.message = "Bad request.";
                return Ok(response);
            }

            db.Entry(user).State = EntityState.Modified;

            try
            {
                //searhc user information
                var searchUserInformation = db.UserInformations.Where(ui => ui.UserId == id).ToArray();
                string emailAddress = searchUserInformation[0].EmailAddress;

                var searchEmail = db.UserInformations.Where(ui => ui.EmailAddress.Equals(emailAddress) && ui.UserId != id).Count();
                if (searchEmail > 0)
                {
                    response.message = "Email address is already used, please choose another one.";
                    return Ok(response);
                }
                var userInformation = db.UserInformations.Find(searchUserInformation[searchUserInformation.Length - 1].Id);
                db.Entry(userInformation).CurrentValues.SetValues(user.UserInformations);
                db.Entry(userInformation).State = EntityState.Modified;
                db.SaveChanges();
                response.objParam1 = user;
                response.status = "SUCCESS";
            }
            catch (Exception e)
            {
                if (!UserExists(id))
                {
                    response.message = "User doesn't exist.";
                }
                else
                {
                    response.message = e.InnerException.InnerException.Message.ToString();
                }
            }

            return Ok(response);
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

        public bool checkIfExist(string userName)
        { 
            var findUser = db.Users.Where(u => u.Username.Equals(userName)).Count();
            if (findUser > 0)
                return true;
            else
                return false;
        }
        
        public void filterRecord(int length, string property, string value, string value2, ref User[] users)
        {
            /* Fields that can be filter
             * Name
             * Desription
             * Status
             */
            //Filter for a specific patient
            int fetch;
            users = null;
            if (property.Equals("UserName"))
            {
                value = value.ToLower();
                var records = db.Users.Where(u => u.Username.ToLower().Contains(value) || u.Username.ToLower().Equals(value)).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUsers = db.Users.Include(u => u.UserInformations)
                                           .Include(u => u.UserType)
                                           .Where(u => u.Username.ToLower().Contains(value) || u.Username.ToLower().Equals(value))
                                           .OrderBy(u => u.Id).Skip((length)).Take(fetch).ToArray();
                    users = getUsers;
                }
            }
            else if (property.Equals("FirstName"))
            {
                value = value.ToLower();
                var records = db.Users.Where(u => u.UserInformations.Where( ui => ui.FirstName.ToLower().Contains(value)).Count() > 0
                                               || u.UserInformations.Where( ui => ui.FirstName.ToLower().Equals(value)).Count() > 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUsers = db.Users
                                     .Include(u => u.UserInformations)
                                     .Include(u => u.UserType)
                                     .Where(u => u.UserInformations.Where(ui => ui.FirstName.ToLower().Contains(value)).Count() > 0
                                            || u.UserInformations.Where(ui => ui.FirstName.ToLower().Equals(value)).Count() > 0)
                                     .OrderBy(u => u.Id).Skip((length)).Take(fetch).ToArray();
                    users = getUsers;
                }
            }
            else if (property.Equals("MiddleName"))
            {
                value = value.ToLower();
                var records = db.Users.Where(u => u.UserInformations.Where(ui => ui.MiddleName.ToLower().Contains(value)).Count() > 0
                                               || u.UserInformations.Where(ui => ui.MiddleName.ToLower().Equals(value)).Count() > 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUsers = db.Users
                                     .Include(u => u.UserInformations)
                                     .Include(u => u.UserType)
                                     .Where(u => u.UserInformations.Where(ui => ui.MiddleName.ToLower().Contains(value)).Count() > 0
                                            || u.UserInformations.Where(ui => ui.MiddleName.ToLower().Equals(value)).Count() > 0)
                                     .OrderBy(u => u.Id).Skip((length)).Take(fetch).ToArray();
                    users = getUsers;
                }
            }
            else if (property.Equals("LastName"))
            {
                value = value.ToLower();
                var records = db.Users.Where(u => u.UserInformations.Where(ui => ui.LastName.ToLower().Contains(value)).Count() > 0
                                               || u.UserInformations.Where(ui => ui.LastName.ToLower().Equals(value)).Count() > 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUsers = db.Users
                                     .Include(u => u.UserInformations)
                                     .Include(u => u.UserType)
                                     .Where(u => u.UserInformations.Where(ui => ui.LastName.ToLower().Contains(value)).Count() > 0
                                            || u.UserInformations.Where(ui => ui.LastName.ToLower().Equals(value)).Count() > 0)
                                     .OrderBy(u => u.Id).Skip((length)).Take(fetch).ToArray();
                    users = getUsers;
                }
            }
            else if (property.Equals("EmailAddress"))
            {
                value = value.ToLower();
                var records = db.Users.Where(u => u.UserInformations.Where(ui => ui.EmailAddress.ToLower().Contains(value)).Count() > 0
                                               || u.UserInformations.Where(ui => ui.EmailAddress.ToLower().Equals(value)).Count() > 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUsers = db.Users
                                     .Include(u => u.UserInformations)
                                     .Include(u => u.UserType)
                                     .Where(u => u.UserInformations.Where(ui => ui.EmailAddress.ToLower().Contains(value)).Count() > 0
                                            || u.UserInformations.Where(ui => ui.EmailAddress.ToLower().Equals(value)).Count() > 0)
                                     .OrderBy(u => u.Id).Skip((length)).Take(fetch).ToArray();
                    users = getUsers;
                }
            }
            else if (property.Equals("Gender"))
            {
                value = value.ToLower();
                var records = db.Users.Where(u => u.UserInformations.Where(ui => ui.Gender.ToLower().Contains(value)).Count() > 0
                                               || u.UserInformations.Where(ui => ui.Gender.ToLower().Equals(value)).Count() > 0).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUsers = db.Users
                                     .Include(u => u.UserInformations)
                                     .Include(u => u.UserType)
                                     .Where(u => u.UserInformations.Where(ui => ui.Gender.ToLower().Contains(value)).Count() > 0
                                            || u.UserInformations.Where(ui => ui.Gender.ToLower().Equals(value)).Count() > 0)
                                     .OrderBy(u => u.Id).Skip((length)).Take(fetch).ToArray();
                    users = getUsers;
                }
            }
            //status
            else
            {
                StringManipulation strManipulate = new StringManipulation(value, value2, "Integer");
                var records = db.Users.Where(u => u.Status == strManipulate.intValue).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUsers = db.Users
                                     .Include(u => u.UserInformations)
                                     .Include(u => u.UserType)
                                     .Where(u => u.Status == strManipulate.intValue)
                                     .OrderBy(u => u.Id).Skip((length)).Take(fetch).ToArray();
                    users = getUsers;
                }
            }
            if (users != null)
            {
                for (int i = 0; i < users.Length; i++)
                {
                    users[0].UserType.UserMenus = null;
                    users[0].UserType.Users = null;
                }
            }
        }
    }
}