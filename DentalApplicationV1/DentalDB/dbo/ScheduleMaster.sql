CREATE TABLE [dbo].[ScheduleMaster]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [Date] DATE NOT NULL, 
    [DentistId] INT NOT NULL, 
    [Status] INT NULL DEFAULT 1,
	CONSTRAINT [FK_ScheduleMaster_DentistId] FOREIGN KEY ([DentistId]) REFERENCES [DentistInformation]([Id])
)
