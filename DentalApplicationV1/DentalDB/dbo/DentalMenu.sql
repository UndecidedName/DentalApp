CREATE TABLE [dbo].[DentalMenu]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [ParentId] INT NULL, 
    [Name] VARCHAR(100) NOT NULL, 
    [Description] VARCHAR(200) NULL, 
	[Url] VARCHAR(50) NULL, 
    [SeqNo] INT NOT NULL,
    [Status] INT NOT NULL DEFAULT 1, 
)
