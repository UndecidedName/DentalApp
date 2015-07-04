CREATE TABLE [dbo].[UserMenu]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [UserTypeId] INT NULL, 
    [Name] VARCHAR(50) NULL, 
    [Description] VARCHAR(200) NULL, 
    [Url] VARCHAR(50) NULL, 
    [Status] INT NULL DEFAULT 1,
	CONSTRAINT [FK_UserMenu_UserTypeId] FOREIGN KEY ([UserTypeId]) REFERENCES [UserType]([Id])
)
