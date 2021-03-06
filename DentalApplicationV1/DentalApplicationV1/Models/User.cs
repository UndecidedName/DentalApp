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
    
    public partial class User
    {
        public User()
        {
            this.Appointments = new HashSet<Appointment>();
            this.Messages = new HashSet<Message>();
            this.Messages1 = new HashSet<Message>();
            this.Notifications = new HashSet<Notification>();
            this.PatientDentalHistories = new HashSet<PatientDentalHistory>();
            this.PatientDiagnosisHistoryMasters = new HashSet<PatientDiagnosisHistoryMaster>();
            this.PatientMedicalHistories = new HashSet<PatientMedicalHistory>();
            this.UserInformations = new HashSet<UserInformation>();
        }
    
        public int Id { get; set; }
        public int UserTypeId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public System.DateTime RegistrationDate { get; set; }
        public string Url { get; set; }
        public int Status { get; set; }
    
        public virtual ICollection<Appointment> Appointments { get; set; }
        public virtual ICollection<Message> Messages { get; set; }
        public virtual ICollection<Message> Messages1 { get; set; }
        public virtual ICollection<Notification> Notifications { get; set; }
        public virtual ICollection<PatientDentalHistory> PatientDentalHistories { get; set; }
        public virtual ICollection<PatientDiagnosisHistoryMaster> PatientDiagnosisHistoryMasters { get; set; }
        public virtual ICollection<PatientMedicalHistory> PatientMedicalHistories { get; set; }
        public virtual UserType UserType { get; set; }
        public virtual ICollection<UserInformation> UserInformations { get; set; }
    }
}
