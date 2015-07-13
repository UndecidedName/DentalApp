CREATE TABLE [dbo].[TreatmentType]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [Name] VARCHAR(50) NOT NULL,
    [Description] VARCHAR(100) NOT NULL, 
    [Status] INT NOT NULL DEFAULT 1, 
)
