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
    
    public partial class Tooth
    {
        public int Id { get; set; }
        public Nullable<int> MouthTypeId { get; set; }
        public Nullable<int> Position { get; set; }
        public Nullable<int> XAxis { get; set; }
        public Nullable<int> YAxis { get; set; }
        public Nullable<int> Width { get; set; }
        public Nullable<int> Height { get; set; }
        public Nullable<int> rotation { get; set; }
        public Nullable<int> ImageUrlId { get; set; }
        public Nullable<int> Status { get; set; }
    
        public virtual ImageUrl ImageUrl { get; set; }
        public virtual MouthType MouthType { get; set; }
    }
}
