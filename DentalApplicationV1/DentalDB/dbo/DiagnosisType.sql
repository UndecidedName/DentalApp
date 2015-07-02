CREATE TABLE [dbo].[DiagnosisType]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [Name] VARCHAR(100) NOT NULL, 
    [Description] VARCHAR(200),
    [Status] INT NOT NULL DEFAULT 1
)
