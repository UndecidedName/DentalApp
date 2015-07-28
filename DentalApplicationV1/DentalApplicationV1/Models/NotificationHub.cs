using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace DentalApplicationV1.Models
{
    public class NotificationHub : Hub
    {
        static ConcurrentDictionary<string, string> clientsDictionary = new ConcurrentDictionary<string, string>();

        public void Send(string name, string message)
        {
            // Call the broadcastMessage method to update clients.
            Clients.All.broadcastNotification(name, message);
        }
        public void addClient(string clientName, string clientId)
        {
            if (!(clientsDictionary.ContainsKey(clientName)))
                clientsDictionary.TryAdd(clientName, clientId);
        }
        public void sendToClient(Notification notification, string clientName)
        {
            // Call the broadcastMessage method to update clients.
            //Clients.Caller.broadcastMessage(notification.Date, notification.Description);
            Clients.Client(clientsDictionary[clientName]).broadcastNotification(notification);
        }
        public override Task OnDisconnected()
        { 
            var name = clientsDictionary.FirstOrDefault(x => x.Value == Context.ConnectionId.ToString());
            string s;
            clientsDictionary.TryRemove(name.Key, out s);
            return Clients.All.disconnected(name.Key);
        }
    }
}