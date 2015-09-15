CREATE TABLE [dbo].[PatientDiagnosisHistoryDetail]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
	[PDHMasterId] INT NOT NULL, 
    [Diagnosis] TEXT NULL, 
    [TreatmentTypeId] INT NULL, 
    [DiagnosedTeeth] VARCHAR(200) NULL,
	CONSTRAINT [FK_PatientDiagnosisHistoryDetail_PDHMasterId] FOREIGN KEY ([PDHMasterId]) REFERENCES [PatientDiagnosisHistoryMaster]([Id]) ON DELETE CASCADE,
	CONSTRAINT [FK_PatientDiagnosisHistoryDetail_TreatmentTypeId] FOREIGN KEY ([TreatmentTypeId]) REFERENCES [TreatmentType]([Id]) ON DELETE SET NULL
)
