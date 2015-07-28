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
The column [dbo].[PatientDentalHistory].[Status] is being dropped, data loss could occur.
*/

IF EXISTS (select top 1 1 from [dbo].[PatientDentalHistory])
    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT

GO
/*
The column [dbo].[PatientMedicalHistory].[Status] is being dropped, data loss could occur.
*/

IF EXISTS (select top 1 1 from [dbo].[PatientMedicalHistory])
    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT

GO
/*
The column [dbo].[PatientMouth].[Status] is being dropped, data loss could occur.
*/

IF EXISTS (select top 1 1 from [dbo].[PatientMouth])
    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT

GO
/*
The column [dbo].[PatientTooth].[Status] is being dropped, data loss could occur.
*/

IF EXISTS (select top 1 1 from [dbo].[PatientTooth])
    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT

GO
PRINT N'Dropping DF__PatientDe__Statu__5CD6CB2B...';


GO
ALTER TABLE [dbo].[PatientDentalHistory] DROP CONSTRAINT [DF__PatientDe__Statu__5CD6CB2B];


GO
PRINT N'Dropping DF__PatientMe__Statu__619B8048...';


GO
ALTER TABLE [dbo].[PatientMedicalHistory] DROP CONSTRAINT [DF__PatientMe__Statu__619B8048];


GO
PRINT N'Dropping DF__PatientMo__Statu__628FA481...';


GO
ALTER TABLE [dbo].[PatientMouth] DROP CONSTRAINT [DF__PatientMo__Statu__628FA481];


GO
PRINT N'Dropping DF__PatientTo__Statu__6383C8BA...';


GO
ALTER TABLE [dbo].[PatientTooth] DROP CONSTRAINT [DF__PatientTo__Statu__6383C8BA];


GO
PRINT N'Altering [dbo].[PatientDentalHistory]...';


GO
ALTER TABLE [dbo].[PatientDentalHistory] DROP COLUMN [Status];


GO
PRINT N'Altering [dbo].[PatientMedicalHistory]...';


GO
ALTER TABLE [dbo].[PatientMedicalHistory] DROP COLUMN [Status];


GO
PRINT N'Altering [dbo].[PatientMouth]...';


GO
ALTER TABLE [dbo].[PatientMouth] DROP COLUMN [Status];


GO
PRINT N'Altering [dbo].[PatientTooth]...';


GO
ALTER TABLE [dbo].[PatientTooth] DROP COLUMN [Status];


GO
PRINT N'Update complete.';


GO
