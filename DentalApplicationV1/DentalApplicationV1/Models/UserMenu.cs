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
    
    public partial class UserMenu
    {
        public int Id { get; set; }
        public int UserTypeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }
        public int Status { get; set; }
    
        public virtual UserType UserType { get; set; }
    }
}
