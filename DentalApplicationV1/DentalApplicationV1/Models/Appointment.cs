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
    
    public partial class Appointment
    {
        public Appointment()
        {
            this.PatientDiagnosisHistoryMasters = new HashSet<PatientDiagnosisHistoryMaster>();
        }
    
        public int Id { get; set; }
        public Nullable<int> PatientId { get; set; }
        public string Message { get; set; }
        public int ScheduleMasterId { get; set; }
        public Nullable<int> ScheduleDetailId { get; set; }
        public int Status { get; set; }
        public string Remarks { get; set; }
        public Nullable<System.DateTime> TransactionDate { get; set; }
    
        public virtual User User { get; set; }
        public virtual ScheduleDetail ScheduleDetail { get; set; }
        public virtual ScheduleMaster ScheduleMaster { get; set; }
        public virtual ICollection<PatientDiagnosisHistoryMaster> PatientDiagnosisHistoryMasters { get; set; }
    }
}
