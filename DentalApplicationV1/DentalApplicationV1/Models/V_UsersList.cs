//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace DentalApplicationV1.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class V_UsersList
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public int UserTypeId { get; set; }
        public int Status { get; set; }
        public string Address { get; set; }
        public System.DateTime BirthDate { get; set; }
        public Nullable<int> CivilStatusId { get; set; }
        public string ContactNo { get; set; }
        public string EmailAddress { get; set; }
        public string FirstName { get; set; }
        public string Gender { get; set; }
        public Nullable<double> Height { get; set; }
        public string LastName { get; set; }
        public string MiddleName { get; set; }
        public string Occupation { get; set; }
        public Nullable<double> Weight { get; set; }
    }
}
