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
    
    public partial class PatientMedicalHistory
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public Nullable<System.DateTime> Question1 { get; set; }
        public string Question2 { get; set; }
        public string Question3 { get; set; }
        public string Question4 { get; set; }
        public string Question5 { get; set; }
        public string Question6 { get; set; }
        public string Question7 { get; set; }
        public Nullable<int> Question8 { get; set; }
        public string Question9 { get; set; }
        public string Question10 { get; set; }
        public string Question11 { get; set; }
        public string Question12 { get; set; }
        public string Question13 { get; set; }
        public string Question14 { get; set; }
        public string Question15 { get; set; }
        public string Question16 { get; set; }
        public string Question17 { get; set; }
        public Nullable<int> Question18 { get; set; }
        public Nullable<int> Question19 { get; set; }
        public int Status { get; set; }
    
        public virtual User User { get; set; }
    }
}