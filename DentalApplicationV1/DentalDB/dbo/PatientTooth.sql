CREATE TABLE [dbo].[PatientTooth]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [PatientMouthId] INT NULL, 
    [Position] INT NULL,
	[XAxis] INT NULL, 
    [YAxis] INT NULL, 
    [Width] INT NULL, 
    [Height] INT NULL, 
    [rotation] INT NULL, 
    [ImageUrlId] INT NULL, 
    [Status] INT NOT NULL DEFAULT 1,
	CONSTRAINT [FK_PatientTooth_PatientMouthId] FOREIGN KEY ([PatientMouthId]) REFERENCES [PatientMouth](Id) ON DELETE SET NULL 
)
