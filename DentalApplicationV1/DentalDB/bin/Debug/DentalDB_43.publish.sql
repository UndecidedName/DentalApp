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
The column [dbo].[ScheduleMaster].[Date] is being dropped, data loss could occur.

The column [dbo].[ScheduleMaster].[FromDate] on table [dbo].[ScheduleMaster] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.

The column [dbo].[ScheduleMaster].[ToDate] on table [dbo].[ScheduleMaster] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.
*/

IF EXISTS (select top 1 1 from [dbo].[ScheduleMaster])
    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT

GO
PRINT N'Dropping DF__tmp_ms_xx__Statu__06CD04F7...';


GO
ALTER TABLE [dbo].[ScheduleMaster] DROP CONSTRAINT [DF__tmp_ms_xx__Statu__06CD04F7];


GO
PRINT N'Dropping FK_ScheduleMaster_DentistId...';


GO
ALTER TABLE [dbo].[ScheduleMaster] DROP CONSTRAINT [FK_ScheduleMaster_DentistId];


GO
PRINT N'Starting rebuilding table [dbo].[ScheduleMaster]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [dbo].[tmp_ms_xx_ScheduleMaster] (
    [Id]        INT  IDENTITY (1, 1) NOT NULL,
    [FromDate]  DATE NOT NULL,
    [ToDate]    DATE NOT NULL,
    [DentistId] INT  NOT NULL,
    [Status]    INT  DEFAULT 1 NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [dbo].[ScheduleMaster])
    BEGIN
        SET IDENTITY_INSERT [dbo].[tmp_ms_xx_ScheduleMaster] ON;
        INSERT INTO [dbo].[tmp_ms_xx_ScheduleMaster] ([Id], [DentistId], [Status])
        SELECT   [Id],
                 [DentistId],
                 [Status]
        FROM     [dbo].[ScheduleMaster]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [dbo].[tmp_ms_xx_ScheduleMaster] OFF;
    END

DROP TABLE [dbo].[ScheduleMaster];

EXECUTE sp_rename N'[dbo].[tmp_ms_xx_ScheduleMaster]', N'ScheduleMaster';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating FK_ScheduleMaster_DentistId...';


GO
ALTER TABLE [dbo].[ScheduleMaster] WITH NOCHECK
    ADD CONSTRAINT [FK_ScheduleMaster_DentistId] FOREIGN KEY ([DentistId]) REFERENCES [dbo].[DentistInformation] ([Id]);


GO
PRINT N'Checking existing data against newly created constraints';


GO
USE [$(DatabaseName)];


GO
ALTER TABLE [dbo].[ScheduleMaster] WITH CHECK CHECK CONSTRAINT [FK_ScheduleMaster_DentistId];


GO
PRINT N'Update complete.';


GO
