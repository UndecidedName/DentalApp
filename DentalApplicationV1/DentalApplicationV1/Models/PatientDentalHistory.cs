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
    
    public partial class PatientDentalHistory
    {
        public int Id { get; set; }
        public Nullable<int> PatientId { get; set; }
        public string Question1 { get; set; }
        public string Question2 { get; set; }
        public string Question3 { get; set; }
        public Nullable<int> Question4 { get; set; }
        public string Question5 { get; set; }
        public string Question6 { get; set; }
        public Nullable<int> Question7a { get; set; }
        public Nullable<int> Question7b { get; set; }
        public Nullable<int> Question7c { get; set; }
        public Nullable<int> Question7d { get; set; }
        public Nullable<int> Question7e { get; set; }
        public Nullable<int> Question7f { get; set; }
        public Nullable<int> Question7g { get; set; }
        public Nullable<int> Question7Others { get; set; }
    
        public virtual User User { get; set; }
    }
}
