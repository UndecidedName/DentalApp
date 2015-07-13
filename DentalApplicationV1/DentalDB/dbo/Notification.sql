CREATE TABLE [dbo].[Notification]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [UserId] INT NOT NULL,
    [Description] VARCHAR(200) NOT NULL, 
    [Date] DATETIME NOT NULL, 
    [Status] INT NOT NULL DEFAULT 0, 
	CONSTRAINT [Fk_Notification_UserId] FOREIGN KEY ([UserId]) REFERENCES [User]([Id]) 
)
