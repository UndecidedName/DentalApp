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
    
    public partial class PatientInformation
    {
        public PatientInformation()
        {
            this.PatientMouths = new HashSet<PatientMouth>();
        }
    
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Gender { get; set; }
        public Nullable<int> Height { get; set; }
        public Nullable<int> Weight { get; set; }
        public System.DateTime BirthDate { get; set; }
        public string Address { get; set; }
        public Nullable<int> CivilStatusId { get; set; }
        public string Occupation { get; set; }
        public string ContactNo { get; set; }
        public string EmailAddress { get; set; }
    
        public virtual CivilStatu CivilStatu { get; set; }
        public virtual User User { get; set; }
        public virtual ICollection<PatientMouth> PatientMouths { get; set; }
    }
}
