CREATE TABLE [dbo].[CivilStatus]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [Name] VARCHAR(50) NOT NULL,
    [Description] VARCHAR(200) NULL, 
    [Status] INT NOT NULL DEFAULT 1, 
)
