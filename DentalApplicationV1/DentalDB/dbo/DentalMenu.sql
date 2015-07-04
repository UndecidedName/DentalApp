CREATE TABLE [dbo].[DentalMenu]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [UserTypeId] INT NULL,
    [Name] VARCHAR(100) NOT NULL, 
    [Description] VARCHAR(200) NULL, 
	[Url] VARCHAR(50) NULL, 
    [Status] INT NOT NULL DEFAULT 1,
    CONSTRAINT [FK_DentalMenu_UserTypeId] FOREIGN KEY ([UserTypeId]) REFERENCES [UserType]([Id])
)
