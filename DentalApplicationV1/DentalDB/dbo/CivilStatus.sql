CREATE TABLE [dbo].[CivilStatus]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [Name] VARCHAR(50) NULL,
    [Description] VARCHAR(200) NOT NULL, 
    [Status] INT NOT NULL DEFAULT 1, 
)
