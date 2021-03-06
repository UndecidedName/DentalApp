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
PRINT N'Rename refactoring operation with key 97a514d4-c2e7-4dc7-a32e-4d51b774f791 is skipped, element [dbo].[PatientDiagnosisHistoryMaster].[SessionStarted] (SqlSimpleColumn) will not be renamed to DiagnosisStarted';


GO
PRINT N'Rename refactoring operation with key 318d7847-5889-4b61-9c7c-3da834c31c1a is skipped, element [dbo].[PatientDiagnosisHistoryMaster].[Se] (SqlSimpleColumn) will not be renamed to DiagnosisEnded';


GO
PRINT N'Dropping DF__PatientDi__Statu__5070F446...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster] DROP CONSTRAINT [DF__PatientDi__Statu__5070F446];


GO
PRINT N'Dropping FK_PatientDiagnosisHistoryDetail_PDHMasterId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryDetail] DROP CONSTRAINT [FK_PatientDiagnosisHistoryDetail_PDHMasterId];


GO
PRINT N'Dropping FK_PatientDiagnosisHistoryMaster_AppointmentId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster] DROP CONSTRAINT [FK_PatientDiagnosisHistoryMaster_AppointmentId];


GO
PRINT N'Dropping FK_PatientDiagnosisHistoryMaster_PatientId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster] DROP CONSTRAINT [FK_PatientDiagnosisHistoryMaster_PatientId];


GO
PRINT N'Starting rebuilding table [dbo].[PatientDiagnosisHistoryMaster]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [dbo].[tmp_ms_xx_PatientDiagnosisHistoryMaster] (
    [Id]               INT      IDENTITY (1, 1) NOT NULL,
    [PatientId]        INT      NOT NULL,
    [AppointmentId]    INT      NOT NULL,
    [Fee]              MONEY    NOT NULL,
    [Paid]             MONEY    NULL,
    [Balance]          MONEY    NULL,
    [DiagnosisStarted] TIME (7) NULL,
    [DiagnosisEnded]   TIME (7) NULL,
    [DiagnosisDate]    DATE     NOT NULL,
    [Status]           INT      DEFAULT 1 NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [dbo].[PatientDiagnosisHistoryMaster])
    BEGIN
        SET IDENTITY_INSERT [dbo].[tmp_ms_xx_PatientDiagnosisHistoryMaster] ON;
        INSERT INTO [dbo].[tmp_ms_xx_PatientDiagnosisHistoryMaster] ([Id], [PatientId], [AppointmentId], [Fee], [Paid], [Balance], [DiagnosisDate], [Status])
        SELECT   [Id],
                 [PatientId],
                 [AppointmentId],
                 [Fee],
                 [Paid],
                 [Balance],
                 [DiagnosisDate],
                 [Status]
        FROM     [dbo].[PatientDiagnosisHistoryMaster]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [dbo].[tmp_ms_xx_PatientDiagnosisHistoryMaster] OFF;
    END

DROP TABLE [dbo].[PatientDiagnosisHistoryMaster];

EXECUTE sp_rename N'[dbo].[tmp_ms_xx_PatientDiagnosisHistoryMaster]', N'PatientDiagnosisHistoryMaster';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating FK_PatientDiagnosisHistoryDetail_PDHMasterId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryDetail] WITH NOCHECK
    ADD CONSTRAINT [FK_PatientDiagnosisHistoryDetail_PDHMasterId] FOREIGN KEY ([PDHMasterId]) REFERENCES [dbo].[PatientDiagnosisHistoryMaster] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_PatientDiagnosisHistoryMaster_AppointmentId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster] WITH NOCHECK
    ADD CONSTRAINT [FK_PatientDiagnosisHistoryMaster_AppointmentId] FOREIGN KEY ([AppointmentId]) REFERENCES [dbo].[Appointment] ([Id]);


GO
PRINT N'Creating FK_PatientDiagnosisHistoryMaster_PatientId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster] WITH NOCHECK
    ADD CONSTRAINT [FK_PatientDiagnosisHistoryMaster_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[User] ([Id]) ON DELETE CASCADE;


GO
-- Refactoring step to update target server with deployed transaction logs
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '97a514d4-c2e7-4dc7-a32e-4d51b774f791')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('97a514d4-c2e7-4dc7-a32e-4d51b774f791')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '318d7847-5889-4b61-9c7c-3da834c31c1a')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('318d7847-5889-4b61-9c7c-3da834c31c1a')

GO

GO
PRINT N'Checking existing data against newly created constraints';


GO
USE [$(DatabaseName)];


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryDetail] WITH CHECK CHECK CONSTRAINT [FK_PatientDiagnosisHistoryDetail_PDHMasterId];

ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster] WITH CHECK CHECK CONSTRAINT [FK_PatientDiagnosisHistoryMaster_AppointmentId];

ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster] WITH CHECK CHECK CONSTRAINT [FK_PatientDiagnosisHistoryMaster_PatientId];


GO
PRINT N'Update complete.';


GO
