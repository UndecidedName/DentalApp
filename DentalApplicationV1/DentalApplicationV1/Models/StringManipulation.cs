using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/* Types:
 * 1 - DateTime
 * 2 - Time/TimeSpan
 * 3 - int
 * 4 - double
 * 5 - decimal
 * 6 - string
 */
namespace DentalApplicationV1.Models
{
    public class StringManipulation
    {
        public string value { get; set; }

        public string type { get; set; }

        public DateTime dateValue { get; set; }
        public TimeSpan timeValue { get; set; }
        public int intValue { get; set; }
        public decimal decimalValue { get; set; }
        public double doubleValue { get; set; }
        public string stringValue { get; set; }
        public StringManipulation()
        {
            this.value = null;
            this.type = null;
            this.dateValue = DateTime.Now;
        }
        public StringManipulation(string value, string type)
        {
            this.value = value;
            this.type = type;
            this.manipulateString();
        }
        public void manipulateString() { 
            //manipulate string values here and initialize  the result to manipulatedValues
            if(this.type.Equals("Date"))
            {
                this.dateValue = Convert.ToDateTime(this.value);
            }
            else if (this.type.Equals("Time"))
            {
                TimeSpan timeHolder;
                TimeSpan.TryParse(this.value, out timeHolder);
                this.timeValue = timeHolder;
            }
            else if (this.type.Equals("Integer"))
            {
                int intHolder;
                Int32.TryParse(this.value, out intHolder);
                this.intValue = intHolder;
            }
            else if (this.type.Equals("Double"))
            {
                this.doubleValue = Convert.ToDouble(this.value);
            }
            else if (this.type.Equals("Decimal"))
            {
                this.decimalValue = Convert.ToDecimal(this.value);
            }
            else
            {
                this.stringValue = value.ToString();
            }
            
        }
    }
}