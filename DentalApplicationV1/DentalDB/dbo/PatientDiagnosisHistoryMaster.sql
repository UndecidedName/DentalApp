CREATE TABLE [dbo].[PatientDiagnosisHistoryMaster]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [PatientId] INT NOT NULL, 
    [AppointmentId] INT NOT NULL,
    [Fee] MONEY NOT NULL, 
    [Paid] MONEY NULL, 
    [Balance] MONEY NULL, 
    [DiagnosisStarted] TIME NULL, 
    [DiagnosisEnded] TIME NULL,  
	[DiagnosisDate] DATE NOT NULL,
    [Status] INT NOT NULL DEFAULT 1,
    CONSTRAINT [FK_PatientDiagnosisHistoryMaster_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [User]([Id]) ON DELETE CASCADE,
	CONSTRAINT [FK_PatientDiagnosisHistoryMaster_AppointmentId] FOREIGN KEY ([AppointmentId]) REFERENCES [Appointment]([Id])
)
