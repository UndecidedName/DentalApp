﻿CREATE TABLE [dbo].[PatientMedicalHistory]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [PatientId] INT NOT NULL,
	[Question1] DATETIME NULL, 
    [Question2] VARCHAR(150) NULL, 
    [Question3] VARCHAR(500) NULL, 
    [Question4] VARCHAR(500) NULL, 
    [Question5] VARCHAR(500) NULL, 
    [Question6] VARCHAR(500) NULL, 
    [Question7] VARCHAR(10) NULL, 
    [Question8] INT NULL DEFAULT 0, 
    [Question9] VARCHAR(500) NULL, 
    [Question10] VARCHAR(500) NULL, 
    [Question11] VARCHAR(100) NULL, 
    [Question12] VARCHAR(500) NULL, 
    [Question13] VARCHAR(500) NULL, 
    [Question14] VARCHAR(500) NULL, 
    [Question15] VARCHAR(100) NULL, 
    [Question16] VARCHAR(100) NULL, 
    [Question17] VARCHAR(100) NULL, 
    [Question18] INT NULL DEFAULT 0, 
    [Question19] INT NULL DEFAULT 0,
    CONSTRAINT [FK_PatientMedicalHistory_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [User]([Id]) ON DELETE CASCADE
)
