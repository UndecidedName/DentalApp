CREATE TABLE [dbo].[TreatmentType]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [Description] VARCHAR(100) NOT NULL, 
    [Status] INT NOT NULL DEFAULT 1
)
