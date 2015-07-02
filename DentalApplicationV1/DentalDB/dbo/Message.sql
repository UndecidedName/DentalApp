CREATE TABLE [dbo].[Message]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [Content] VARCHAR(1000) NULL, 
    [SenderId] INT NULL, 
    [ReceiverId] INT NULL, 
    [SendDate] DATETIME NOT NULL, 
    [ReceivedDate] DATETIME NOT NULL, 
    [Status] INT NOT NULL DEFAULT 0,
	CONSTRAINT [FK_User_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [User]([Id]),
	CONSTRAINT [FK_User_ReceiverId] FOREIGN KEY ([ReceiverId]) REFERENCES [User]([Id])
)
