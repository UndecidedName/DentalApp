using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace YbanezNacua.Models
{
    public class Response
    {
        public string status { get; set; }
        public string param1 { get; set; }
        public string param2 { get; set; }
        public string param3 { get; set; }
        public string message { get; set; }
        public int intParam1 { get; set; }
        public object objParam1 { get; set; }
    }
}