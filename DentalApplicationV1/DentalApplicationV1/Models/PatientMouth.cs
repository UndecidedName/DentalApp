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
    
    public partial class PatientMouth
    {
        public PatientMouth()
        {
            this.PatientTeeth = new HashSet<PatientTooth>();
        }
    
        public int Id { get; set; }
        public Nullable<int> MouthTypeId { get; set; }
        public Nullable<int> PatientId { get; set; }
    
        public virtual MouthType MouthType { get; set; }
        public virtual UserInformation UserInformation { get; set; }
        public virtual ICollection<PatientTooth> PatientTeeth { get; set; }
    }
}
