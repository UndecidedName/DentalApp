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
PRINT N'Dropping DF__tmp_ms_xx__Statu__236943A5...';


GO
ALTER TABLE [dbo].[DentalMenu] DROP CONSTRAINT [DF__tmp_ms_xx__Statu__236943A5];


GO
PRINT N'Dropping FK_DentalMenu_UserTypeId...';


GO
ALTER TABLE [dbo].[DentalMenu] DROP CONSTRAINT [FK_DentalMenu_UserTypeId];


GO
PRINT N'Starting rebuilding table [dbo].[DentalMenu]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [dbo].[tmp_ms_xx_DentalMenu] (
    [Id]          INT           NOT NULL,
    [UserTypeId]  INT           NULL,
    [Name]        VARCHAR (100) NOT NULL,
    [Description] VARCHAR (200) NULL,
    [Url]         VARCHAR (50)  NULL,
    [Status]      INT           DEFAULT 1 NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [dbo].[DentalMenu])
    BEGIN
        INSERT INTO [dbo].[tmp_ms_xx_DentalMenu] ([Id], [UserTypeId], [Name], [Description], [Url], [Status])
        SELECT   [Id],
                 [UserTypeId],
                 [Name],
                 [Description],
                 [Url],
                 [Status]
        FROM     [dbo].[DentalMenu]
        ORDER BY [Id] ASC;
    END

DROP TABLE [dbo].[DentalMenu];

EXECUTE sp_rename N'[dbo].[tmp_ms_xx_DentalMenu]', N'DentalMenu';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating FK_DentalMenu_UserTypeId...';


GO
ALTER TABLE [dbo].[DentalMenu] WITH NOCHECK
    ADD CONSTRAINT [FK_DentalMenu_UserTypeId] FOREIGN KEY ([UserTypeId]) REFERENCES [dbo].[UserType] ([Id]);


GO
PRINT N'Checking existing data against newly created constraints';


GO
USE [$(DatabaseName)];


GO
ALTER TABLE [dbo].[DentalMenu] WITH CHECK CHECK CONSTRAINT [FK_DentalMenu_UserTypeId];


GO
PRINT N'Update complete.';


GO
