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
    public class UserInformationsController : ApiController
    {
        private DentalDBEntities db = new DentalDBEntities();
        private MyGenerator generator = new MyGenerator();
        private Response response = new Response();
        private int pageSize = 20;
        // GET: api/UserInformations
        public IQueryable<UserInformation> GetUserInformations()
        {
            return db.UserInformations;
        }

        // GET: api/UserInformations?length=0&userType=1
        public IHttpActionResult GetUserInformations(int length, int userType)
        {
            int fetch;
            var records = db.UserInformations.Where(ui => ui.User.UserTypeId == userType && ui.User.Status == 1).Count();
            if (records > length)
            {
                if ((records - length) > pageSize)
                    fetch = pageSize;
                else
                    fetch = records - length;
                var userInformations = db.UserInformations.Where(ui => ui.User.UserTypeId == userType && ui.User.Status == 1).ToArray();
                userInformations[0].User = null;
                userInformations[0].ScheduleMasters = null;
                userInformations[0].PatientMouths = null;
                userInformations[0].CivilStatu = null;
                return Ok(userInformations.Skip((length)).Take(fetch));
            }
            else
                return Ok();
        }
        //Filtering, regardless of the status
        public IHttpActionResult GetUserInformations(int length, int userType, string property, string value, string value2) 
        {
            UserInformation[] userInformation = new UserInformation[pageSize];
            this.filterRecord(length, userType, property, value, value2, ref userInformation);
            if (userInformation != null)
                return Ok(userInformation);
            else
                return Ok(); 
        }
        //Filtering base on status
        public IHttpActionResult GetUserInformations(int length, int userType, int status, string property, string value, string value2)
        {
            UserInformation[] userInformation = new UserInformation[pageSize];
            this.filterRecord(length, userType, status, property, value, value2, ref userInformation);
            if (userInformation != null)
                return Ok(userInformation);
            else
                return Ok();
        }
        // GET: api/UserInformations/5
        [ResponseType(typeof(UserInformation))]
        public IHttpActionResult GetUserInformation(int id)
        {
            UserInformation UserInformation = db.UserInformations.Find(id);
            if (UserInformation == null)
            {
                return NotFound();
            }

            return Ok(UserInformation);
        }

        // PUT: api/UserInformations/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutUserInformation(int id, UserInformation userInformation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != userInformation.Id)
            {
                return BadRequest();
            }

            db.Entry(userInformation).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserInformationExists(id))
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

        // POST: api/UserInformations
        [ResponseType(typeof(UserInformation))]
        public IHttpActionResult PostUserInformation(UserInformation userInformation)
        {
            response.status = "FAILURE";
            var searchEmail = db.UserInformations.Where(ui => ui.EmailAddress.Equals(userInformation.EmailAddress)).Count();

            if (!ModelState.IsValid)
            {
                response.message = "Bad request.";
                return Ok(response);
            }
            else if (this.checkIfExist(userInformation.User.Username))
            {
                response.message = "Username is already used, please choose another one.";
                return Ok(response);
            }
            else if (searchEmail > 0)
            {
                response.message = "Email address is already used, please choose another one.";
                return Ok(response);
            }
            else
            {
                try
                {
                    User userDetails = new User();
                    userDetails.Username = userInformation.User.Username;
                    userDetails.Password = userInformation.User.Password;
                    userDetails.Url = this.generateUrl(20, userDetails.Username);
                    userDetails.UserTypeId = 6;
                    userDetails.Status = 0;

                    //email url
                    this.emailUrl(userDetails.Url, userInformation.EmailAddress, userInformation.FirstName);

                    db.Users.Add(userDetails);
                    userInformation.User = null;
                    userInformation.UserId = userDetails.Id;
                    db.UserInformations.Add(userInformation);
                    db.SaveChanges();
                    response.status = "SUCCESS";
                    response.message = "Thank you for your patience. Please check your email for account activation.";
                }
                catch (Exception e)
                {
                    response.message = e.Message.ToString();
                }
            }
            return Ok(response);
        }

        // DELETE: api/UserInformations/5
        [ResponseType(typeof(UserInformation))]
        public IHttpActionResult DeleteUserInformation(int id)
        {
            UserInformation UserInformation = db.UserInformations.Find(id);
            if (UserInformation == null)
            {
                return NotFound();
            }

            db.UserInformations.Remove(UserInformation);
            db.SaveChanges();

            return Ok(UserInformation);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserInformationExists(int id)
        {
            return db.UserInformations.Count(e => e.Id == id) > 0;
        }

        public bool checkIfExist(string userName)
        {
            UsersController u = new UsersController();
            if (u.checkIfExist(userName))
                return true;
            else
                return false;
        }
        public string generateUrl(int size, string userName)
        {
            var rootUrl = Url.Content("~/");
            var url = rootUrl + "api/Users?url=" + generator.generateCode(20) + "&username=" + userName + "&app=dental";
            return url;
        }

        private void emailUrl(string url, string recipient, string firstName)
        {
            String header, body, footer;
            //send email
            GMailer.GmailUsername = "smilefairies2015@gmail.com";
            GMailer.GmailPassword = "123smile";

            GMailer mailer = new GMailer();

            header = "Hi " + firstName + "<br><br>" + "Good Day! <br> <br>";
            body = "For security purposes , please activate your account by clicking the link below. <br><br>Verification Link: " + url + ".<br><br>Thank you and God Bless! <br><br>";
            footer = "Yours Truly, <br> Smile Fairies Dental Suites";
            mailer.ToEmail = recipient;
            mailer.Subject = "Account Activation";
            mailer.Body = header + body + footer;
            mailer.IsHtml = true;
            mailer.Send();
        }

        public void filterRecord(int length, int userType, string property, string value, string value2, ref UserInformation[] userInformation)
        {
            /* Fields that can be filter
             * FirstName
             * LastName
             * MiddleName
             * Gender
             * ContactNo
             */
            //Filter for a specific patient
            int fetch;
            userInformation = null;
            if (property.Equals("FirstName"))
            {
                value = value.ToLower();
                var records = db.UserInformations.Where(ui => (ui.FirstName.ToLower().Contains(value) || ui.FirstName.ToLower().ToLower().Equals(value))
                                                        && ui.User.UserTypeId == userType).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserInformation = db.UserInformations.Where(ui => (ui.FirstName.ToLower().Contains(value) || ui.FirstName.ToLower().ToLower().Equals(value))
                                                                        && ui.User.UserTypeId == userType)
                                                                        .OrderBy(ui => ui.Id).Skip((length)).Take(fetch).ToArray();
                    userInformation = getUserInformation;
                }
            }
            else if (property.Equals("MiddleName"))
            {
                value = value.ToLower();
                var records = db.UserInformations.Where(ui => (ui.MiddleName.ToLower().Contains(value) || ui.MiddleName.ToLower().ToLower().Equals(value))
                                                        && ui.User.UserTypeId == userType).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserInformation = db.UserInformations.Where(ui => (ui.MiddleName.ToLower().Contains(value) || ui.MiddleName.ToLower().ToLower().Equals(value))
                                                                        && ui.User.UserTypeId == userType)
                                                                        .OrderBy(ui => ui.Id).Skip((length)).Take(fetch).ToArray();
                    userInformation = getUserInformation;
                }
            }
            else if (property.Equals("LastName"))
            {
                value = value.ToLower();
                var records = db.UserInformations.Where(ui => (ui.LastName.ToLower().Contains(value) || ui.LastName.ToLower().ToLower().Equals(value))
                                                        && ui.User.UserTypeId == userType).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserInformation = db.UserInformations.Where(ui => (ui.LastName.ToLower().Contains(value) || ui.LastName.ToLower().ToLower().Equals(value))
                                                                        && ui.User.UserTypeId == userType)
                                                                        .OrderBy(ui => ui.Id).Skip((length)).Take(fetch).ToArray();
                    userInformation = getUserInformation;
                }
            }
            else if (property.Equals("Gender"))
            {
                value = value.ToLower();
                var records = db.UserInformations.Where(ui => (ui.Gender.ToLower().Contains(value) || ui.Gender.ToLower().ToLower().Equals(value))
                                                        && ui.User.UserTypeId == userType).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserInformation = db.UserInformations.Where(ui => (ui.Gender.ToLower().Contains(value) || ui.Gender.ToLower().ToLower().Equals(value))
                                                                        && ui.User.UserTypeId == userType)
                                                                        .OrderBy(ui => ui.Id).Skip((length)).Take(fetch).ToArray();
                    userInformation = getUserInformation;
                }
            }
            //ContactNo
            else
            {
                value = value.ToLower();
                var records = db.UserInformations.Where(ui => ui.Gender.ToLower().ToLower().Equals(value) && ui.User.UserTypeId == userType).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserInformation = db.UserInformations.Where(ui => ui.Gender.ToLower().ToLower().Equals(value) && ui.User.UserTypeId == userType)
                                                                .OrderBy(ui => ui.Id).Skip((length)).Take(fetch).ToArray();
                    userInformation = getUserInformation;
                }
            }
        }

        public void filterRecord(int length, int userType, int status, string property, string value, string value2, ref UserInformation[] userInformation)
        {
            /* Fields that can be filter
             * FirstName
             * LastName
             * MiddleName
             * Gender
             * ContactNo
             */
            //Filter for a specific patient
            int fetch;
            userInformation = null;
            if (property.Equals("FirstName"))
            {
                value = value.ToLower();
                var records = db.UserInformations.Where(ui => (ui.FirstName.ToLower().Contains(value) || ui.FirstName.ToLower().ToLower().Equals(value))
                                                        && ui.User.UserTypeId == userType && ui.User.Status == status).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserInformation = db.UserInformations.Where(ui => (ui.FirstName.ToLower().Contains(value) || ui.FirstName.ToLower().ToLower().Equals(value))
                                                                        && ui.User.UserTypeId == userType && ui.User.Status == status)
                                                                        .OrderBy(ui => ui.Id).Skip((length)).Take(fetch).ToArray();
                    userInformation = getUserInformation;
                }
            }
            else if (property.Equals("MiddleName"))
            {
                value = value.ToLower();
                var records = db.UserInformations.Where(ui => (ui.MiddleName.ToLower().Contains(value) || ui.MiddleName.ToLower().ToLower().Equals(value))
                                                        && ui.User.UserTypeId == userType && ui.User.Status == status).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserInformation = db.UserInformations.Where(ui => (ui.MiddleName.ToLower().Contains(value) || ui.MiddleName.ToLower().ToLower().Equals(value))
                                                                        && ui.User.UserTypeId == userType && ui.User.Status == status)
                                                                        .OrderBy(ui => ui.Id).Skip((length)).Take(fetch).ToArray();
                    userInformation = getUserInformation;
                }
            }
            else if (property.Equals("LastName"))
            {
                value = value.ToLower();
                var records = db.UserInformations.Where(ui => (ui.LastName.ToLower().Contains(value) || ui.LastName.ToLower().ToLower().Equals(value))
                                                        && ui.User.UserTypeId == userType && ui.User.Status == status).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserInformation = db.UserInformations.Where(ui => (ui.LastName.ToLower().Contains(value) || ui.LastName.ToLower().ToLower().Equals(value))
                                                                        && ui.User.UserTypeId == userType && ui.User.Status == status)
                                                                        .OrderBy(ui => ui.Id).Skip((length)).Take(fetch).ToArray();
                    userInformation = getUserInformation;
                }
            }
            else if (property.Equals("Gender"))
            {
                value = value.ToLower();
                var records = db.UserInformations.Where(ui => (ui.Gender.ToLower().Contains(value) || ui.Gender.ToLower().ToLower().Equals(value))
                                                        && ui.User.UserTypeId == userType && ui.User.Status == status).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserInformation = db.UserInformations.Where(ui => (ui.Gender.ToLower().Contains(value) || ui.Gender.ToLower().ToLower().Equals(value))
                                                                        && ui.User.UserTypeId == userType && ui.User.Status == status)
                                                                        .OrderBy(ui => ui.Id).Skip((length)).Take(fetch).ToArray();
                    userInformation = getUserInformation;
                }
            }
            //ContactNo
            else
            {
                value = value.ToLower();
                var records = db.UserInformations.Where(ui => ui.Gender.ToLower().ToLower().Equals(value) && ui.User.UserTypeId == userType && ui.User.Status == status).Count();
                if (records > length)
                {
                    if ((records - length) > pageSize)
                        fetch = pageSize;
                    else
                        fetch = records - length;
                    var getUserInformation = db.UserInformations.Where(ui => ui.Gender.ToLower().ToLower().Equals(value) && ui.User.UserTypeId == userType && ui.User.Status == status)
                                                                .OrderBy(ui => ui.Id).Skip((length)).Take(fetch).ToArray();
                    userInformation = getUserInformation;
                }
            }
        }
    }
}