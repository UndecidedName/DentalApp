CREATE TABLE [dbo].[DentistInformation]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [FirstName] VARCHAR(100) NOT NULL, 
    [MiddleName] VARCHAR(100) NULL, 
    [LastName] VARCHAR(100) NOT NULL,  
	[Gender] CHAR NOT NULL, 
    [Height] INT NULL, 
    [Weight] INT NULL, 
    [BirthDate] DATETIME NOT NULL, 
    [Address] VARCHAR(200) NULL,
    [CivilStatusId] INT NULL,
    [ContactNo] VARCHAR(50) NULL, 
    [EmailAddress] VARCHAR(100) NULL,
	[Status] INT NULL, 
    CONSTRAINT [FK_DentistInformation_CivilStatus] FOREIGN KEY ([CivilStatusId]) REFERENCES [CivilStatus]([Id]) ON DELETE SET NULL
)
