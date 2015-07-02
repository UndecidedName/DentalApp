CREATE TABLE [dbo].[Notification]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [Description] VARCHAR(200) NOT NULL, 
    [Date] DATETIME NOT NULL, 
    [Status] INT NOT NULL DEFAULT 0
)
