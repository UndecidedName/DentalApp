CREATE TABLE [dbo].[PatientMouth]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [MouthTypeId] INT NULL, 
    [PatientId] INT NULL, 
    [Status] INT NOT NULL DEFAULT 1,
	CONSTRAINT [FK_PatientMouth_MouthTypeId] FOREIGN KEY ([MouthTypeId]) REFERENCES [MouthType](Id) ON DELETE SET NULL,
	CONSTRAINT [FK_PatientMouth_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [UserInformation](Id) ON DELETE SET NULL
)