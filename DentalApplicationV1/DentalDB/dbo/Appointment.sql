CREATE TABLE [dbo].[Appointment]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [PatientId] INT NULL, 
    [DentistId] INT NULL, 
    [Message] VARCHAR(500) NOT NULL, 
    [AppointmentDate] DATETIME NOT NULL, 
    [Status] INT NOT NULL,
	CONSTRAINT [FK_Appointment_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [User]([Id]) ON DELETE CASCADE,
	CONSTRAINT [FK_Appointment_DentistId] FOREIGN KEY ([DentistId]) REFERENCES [DentistInformation]([Id])
)
