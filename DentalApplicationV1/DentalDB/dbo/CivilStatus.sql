CREATE TABLE [dbo].[CivilStatus]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [Description] VARCHAR(20) NOT NULL, 
    [Status] INT NOT NULL DEFAULT 1
)
