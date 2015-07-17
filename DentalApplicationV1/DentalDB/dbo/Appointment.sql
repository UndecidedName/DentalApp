CREATE TABLE [dbo].[Appointment]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [PatientId] INT NULL, 
    [Message] VARCHAR(500) NULL, 
    [ScheduleMasterId] INT NOT NULL, 
    [ScheduleDetailId] INT NULL, 
    [Remarks] VARCHAR(500) NULL, 
    [TransactionDate] DATETIME NULL, 
    [Status] INT NOT NULL,
    CONSTRAINT [FK_Appointment_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [User]([Id]) ON DELETE CASCADE,
	CONSTRAINT [FK_Appointment_ScheduleMasterId] FOREIGN KEY ([ScheduleMasterId]) REFERENCES [ScheduleMaster]([Id]),
	CONSTRAINT [FK_Appointment_ScheduleDetailId] FOREIGN KEY ([ScheduleDetailId]) REFERENCES [ScheduleDetail]([Id])
)
