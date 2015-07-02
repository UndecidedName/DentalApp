CREATE TABLE [dbo].[PatientInformation]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [PatientId] INT NOT NULL,
	[FirstName] VARCHAR(100) NOT NULL, 
    [MiddleName] VARCHAR(100) NULL, 
    [LastName] VARCHAR(100) NOT NULL,  
	[Gender] CHAR NOT NULL, 
    [Height] INT NULL, 
    [Weight] INT NULL, 
    [BirthDate] DATETIME NOT NULL, 
    [Address] VARCHAR(200) NULL,
    [CivilStatusId] INT NULL, 
    [Occupation] VARCHAR(100) NULL, 
    [ContactNo] VARCHAR(50) NULL, 
    [EmailAddress] VARCHAR(100) NULL, 
    CONSTRAINT [FK_PatientInformation_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [User]([Id]) ON DELETE CASCADE,
	CONSTRAINT [FK_PatientInformation_CivilStatusId] FOREIGN KEY ([CivilStatusId]) REFERENCES [CivilStatus]([Id]) ON DELETE SET NULL
)
