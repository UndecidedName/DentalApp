﻿/*
Deployment script for DentalDB

This code was generated by a tool.
Changes to this file may cause incorrect behavior and will be lost if
the code is regenerated.
*/

GO
SET ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER ON;

SET NUMERIC_ROUNDABORT OFF;


GO
:setvar DatabaseName "DentalDB"
:setvar DefaultFilePrefix "DentalDB"
:setvar DefaultDataPath "C:\Program Files\Microsoft SQL Server\MSSQL10_50.MSSQLSERVER\MSSQL\DATA\"
:setvar DefaultLogPath "C:\Program Files\Microsoft SQL Server\MSSQL10_50.MSSQLSERVER\MSSQL\DATA\"

GO
:on error exit
GO
/*
Detect SQLCMD mode and disable script execution if SQLCMD mode is not supported.
To re-enable the script after enabling SQLCMD mode, execute the following:
SET NOEXEC OFF; 
*/
:setvar __IsSqlCmdEnabled "True"
GO
IF N'$(__IsSqlCmdEnabled)' NOT LIKE N'True'
    BEGIN
        PRINT N'SQLCMD mode must be enabled to successfully execute this script.';
        SET NOEXEC ON;
    END


GO
USE [$(DatabaseName)];


GO
/*
The column [dbo].[Appointment].[Type] on table [dbo].[Appointment] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.
*/

IF EXISTS (select top 1 1 from [dbo].[Appointment])
    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT

GO
PRINT N'Rename refactoring operation with key dac869cd-ec15-4324-8b41-f4460e752510 is skipped, element [dbo].[Appointment].[type] (SqlSimpleColumn) will not be renamed to Type';


GO
PRINT N'Dropping FK_PatientDiagnosisHistoryMaster_AppointmentId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster] DROP CONSTRAINT [FK_PatientDiagnosisHistoryMaster_AppointmentId];


GO
PRINT N'Dropping FK_Appointment_PatientId...';


GO
ALTER TABLE [dbo].[Appointment] DROP CONSTRAINT [FK_Appointment_PatientId];


GO
PRINT N'Dropping FK_Appointment_ScheduleMasterId...';


GO
ALTER TABLE [dbo].[Appointment] DROP CONSTRAINT [FK_Appointment_ScheduleMasterId];


GO
PRINT N'Dropping FK_Appointment_ScheduleDetailId...';


GO
ALTER TABLE [dbo].[Appointment] DROP CONSTRAINT [FK_Appointment_ScheduleDetailId];


GO
PRINT N'Starting rebuilding table [dbo].[Appointment]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [dbo].[tmp_ms_xx_Appointment] (
    [Id]               INT           IDENTITY (1, 1) NOT NULL,
    [PatientId]        INT           NULL,
    [Message]          VARCHAR (500) NULL,
    [ScheduleMasterId] INT           NOT NULL,
    [ScheduleDetailId] INT           NULL,
    [Remarks]          VARCHAR (500) NULL,
    [TransactionDate]  DATETIME      NULL,
    [Type]             VARCHAR (50)  NOT NULL,
    [Status]           INT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [dbo].[Appointment])
    BEGIN
        SET IDENTITY_INSERT [dbo].[tmp_ms_xx_Appointment] ON;
        INSERT INTO [dbo].[tmp_ms_xx_Appointment] ([Id], [PatientId], [Message], [ScheduleMasterId], [ScheduleDetailId], [Remarks], [TransactionDate], [Status])
        SELECT   [Id],
                 [PatientId],
                 [Message],
                 [ScheduleMasterId],
                 [ScheduleDetailId],
                 [Remarks],
                 [TransactionDate],
                 [Status]
        FROM     [dbo].[Appointment]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [dbo].[tmp_ms_xx_Appointment] OFF;
    END

DROP TABLE [dbo].[Appointment];

EXECUTE sp_rename N'[dbo].[tmp_ms_xx_Appointment]', N'Appointment';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating FK_PatientDiagnosisHistoryMaster_AppointmentId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster] WITH NOCHECK
    ADD CONSTRAINT [FK_PatientDiagnosisHistoryMaster_AppointmentId] FOREIGN KEY ([AppointmentId]) REFERENCES [dbo].[Appointment] ([Id]);


GO
PRINT N'Creating FK_Appointment_PatientId...';


GO
ALTER TABLE [dbo].[Appointment] WITH NOCHECK
    ADD CONSTRAINT [FK_Appointment_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[User] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Appointment_ScheduleMasterId...';


GO
ALTER TABLE [dbo].[Appointment] WITH NOCHECK
    ADD CONSTRAINT [FK_Appointment_ScheduleMasterId] FOREIGN KEY ([ScheduleMasterId]) REFERENCES [dbo].[ScheduleMaster] ([Id]);


GO
PRINT N'Creating FK_Appointment_ScheduleDetailId...';


GO
ALTER TABLE [dbo].[Appointment] WITH NOCHECK
    ADD CONSTRAINT [FK_Appointment_ScheduleDetailId] FOREIGN KEY ([ScheduleDetailId]) REFERENCES [dbo].[ScheduleDetail] ([Id]);


GO
-- Refactoring step to update target server with deployed transaction logs
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'dac869cd-ec15-4324-8b41-f4460e752510')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('dac869cd-ec15-4324-8b41-f4460e752510')

GO

GO
PRINT N'Checking existing data against newly created constraints';


GO
USE [$(DatabaseName)];


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster] WITH CHECK CHECK CONSTRAINT [FK_PatientDiagnosisHistoryMaster_AppointmentId];

ALTER TABLE [dbo].[Appointment] WITH CHECK CHECK CONSTRAINT [FK_Appointment_PatientId];

ALTER TABLE [dbo].[Appointment] WITH CHECK CHECK CONSTRAINT [FK_Appointment_ScheduleMasterId];

ALTER TABLE [dbo].[Appointment] WITH CHECK CHECK CONSTRAINT [FK_Appointment_ScheduleDetailId];


GO
PRINT N'Update complete.';


GO
