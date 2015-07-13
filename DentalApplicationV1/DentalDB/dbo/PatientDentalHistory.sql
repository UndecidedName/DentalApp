CREATE TABLE [dbo].[PatientDentalHistory]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [PatientId] INT NULL, 
    [Question1] VARCHAR(500) NULL, 
    [Question2] VARCHAR(500) NULL, 
    [Question3] VARCHAR(500) NULL, 
    [Question4] INT NULL DEFAULT 0, 
    [Question5] VARCHAR(500) NULL, 
    [Question6] VARCHAR(500) NULL, 
    [Question7a] INT NULL, 
    [Question7b] INT NULL,
	[Question7c] INT NULL, 
	[Question7d] INT NULL, 
	[Question7e] INT NULL, 
	[Question7f] INT NULL, 
	[Question7g] INT NULL, 
	[Question7Others] INT NULL,
	[Status] INT NULL DEFAULT 1, 
    CONSTRAINT [FK_PatientDentalHistory_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [User]([Id]) ON DELETE CASCADE
)
