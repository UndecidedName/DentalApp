﻿/*
Deployment script for DentalDB_1

This code was generated by a tool.
Changes to this file may cause incorrect behavior and will be lost if
the code is regenerated.
*/

GO
SET ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER ON;

SET NUMERIC_ROUNDABORT OFF;


GO
:setvar DatabaseName "DentalDB_1"
:setvar DefaultFilePrefix "DentalDB_1"
:setvar DefaultDataPath ""
:setvar DefaultLogPath ""

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
USE [master];


GO

IF (DB_ID(N'$(DatabaseName)') IS NOT NULL) 
BEGIN
    ALTER DATABASE [$(DatabaseName)]
    SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [$(DatabaseName)];
END

GO
PRINT N'Creating $(DatabaseName)...'
GO
CREATE DATABASE [$(DatabaseName)] COLLATE SQL_Latin1_General_CP1_CI_AS
GO
IF EXISTS (SELECT 1
           FROM   [master].[dbo].[sysdatabases]
           WHERE  [name] = N'$(DatabaseName)')
    BEGIN
        ALTER DATABASE [$(DatabaseName)]
            SET ANSI_NULLS ON,
                ANSI_PADDING ON,
                ANSI_WARNINGS ON,
                ARITHABORT ON,
                CONCAT_NULL_YIELDS_NULL ON,
                NUMERIC_ROUNDABORT OFF,
                QUOTED_IDENTIFIER ON,
                ANSI_NULL_DEFAULT ON,
                CURSOR_DEFAULT LOCAL,
                RECOVERY FULL,
                CURSOR_CLOSE_ON_COMMIT OFF,
                AUTO_CREATE_STATISTICS ON,
                AUTO_SHRINK OFF,
                AUTO_UPDATE_STATISTICS ON,
                RECURSIVE_TRIGGERS OFF 
            WITH ROLLBACK IMMEDIATE;
        ALTER DATABASE [$(DatabaseName)]
            SET AUTO_CLOSE OFF 
            WITH ROLLBACK IMMEDIATE;
    END


GO
IF EXISTS (SELECT 1
           FROM   [master].[dbo].[sysdatabases]
           WHERE  [name] = N'$(DatabaseName)')
    BEGIN
        ALTER DATABASE [$(DatabaseName)]
            SET ALLOW_SNAPSHOT_ISOLATION OFF;
    END


GO
IF EXISTS (SELECT 1
           FROM   [master].[dbo].[sysdatabases]
           WHERE  [name] = N'$(DatabaseName)')
    BEGIN
        ALTER DATABASE [$(DatabaseName)]
            SET READ_COMMITTED_SNAPSHOT OFF;
    END


GO
IF EXISTS (SELECT 1
           FROM   [master].[dbo].[sysdatabases]
           WHERE  [name] = N'$(DatabaseName)')
    BEGIN
        ALTER DATABASE [$(DatabaseName)]
            SET AUTO_UPDATE_STATISTICS_ASYNC OFF,
                PAGE_VERIFY NONE,
                DATE_CORRELATION_OPTIMIZATION OFF,
                DISABLE_BROKER,
                PARAMETERIZATION SIMPLE,
                SUPPLEMENTAL_LOGGING OFF 
            WITH ROLLBACK IMMEDIATE;
    END


GO
IF IS_SRVROLEMEMBER(N'sysadmin') = 1
    BEGIN
        IF EXISTS (SELECT 1
                   FROM   [master].[dbo].[sysdatabases]
                   WHERE  [name] = N'$(DatabaseName)')
            BEGIN
                EXECUTE sp_executesql N'ALTER DATABASE [$(DatabaseName)]
    SET TRUSTWORTHY OFF,
        DB_CHAINING OFF 
    WITH ROLLBACK IMMEDIATE';
            END
    END
ELSE
    BEGIN
        PRINT N'The database settings cannot be modified. You must be a SysAdmin to apply these settings.';
    END


GO
IF IS_SRVROLEMEMBER(N'sysadmin') = 1
    BEGIN
        IF EXISTS (SELECT 1
                   FROM   [master].[dbo].[sysdatabases]
                   WHERE  [name] = N'$(DatabaseName)')
            BEGIN
                EXECUTE sp_executesql N'ALTER DATABASE [$(DatabaseName)]
    SET HONOR_BROKER_PRIORITY OFF 
    WITH ROLLBACK IMMEDIATE';
            END
    END
ELSE
    BEGIN
        PRINT N'The database settings cannot be modified. You must be a SysAdmin to apply these settings.';
    END


GO
USE [$(DatabaseName)];


GO
IF fulltextserviceproperty(N'IsFulltextInstalled') = 1
    EXECUTE sp_fulltext_database 'enable';


GO
PRINT N'Creating [dbo].[Logs]...';


GO
CREATE TABLE [dbo].[Logs] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [Description] VARCHAR (500) NOT NULL,
    [Date]        DATETIME      NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[Message]...';


GO
CREATE TABLE [dbo].[Message] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [Content]      VARCHAR (1000) NULL,
    [SenderId]     INT            NULL,
    [ReceiverId]   INT            NULL,
    [SendDate]     DATETIME       NOT NULL,
    [ReceivedDate] DATETIME       NOT NULL,
    [Status]       INT            NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[ImageUrl]...';


GO
CREATE TABLE [dbo].[ImageUrl] (
    [Id]     INT           IDENTITY (1, 1) NOT NULL,
    [Url]    VARCHAR (200) NOT NULL,
    [Status] INT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[Tooth]...';


GO
CREATE TABLE [dbo].[Tooth] (
    [Id]          INT IDENTITY (1, 1) NOT NULL,
    [MouthTypeId] INT NULL,
    [Position]    INT NULL,
    [XAxis]       INT NULL,
    [YAxis]       INT NULL,
    [Width]       INT NULL,
    [Height]      INT NULL,
    [rotation]    INT NULL,
    [ImageUrlId]  INT NULL,
    [Status]      INT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[MouthType]...';


GO
CREATE TABLE [dbo].[MouthType] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [Name]        VARCHAR (50)  NOT NULL,
    [Description] VARCHAR (100) NOT NULL,
    [ImageUrlId]  INT           NULL,
    [Status]      INT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[DiagnosisType]...';


GO
CREATE TABLE [dbo].[DiagnosisType] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [Name]        VARCHAR (100) NOT NULL,
    [Description] VARCHAR (200) NULL,
    [Status]      INT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[UserType]...';


GO
CREATE TABLE [dbo].[UserType] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [Name]        VARCHAR (20)  NOT NULL,
    [Description] VARCHAR (100) NOT NULL,
    [Status]      INT           NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[PatientDiagnosisHistoryDetail]...';


GO
CREATE TABLE [dbo].[PatientDiagnosisHistoryDetail] (
    [Id]              INT           IDENTITY (1, 1) NOT NULL,
    [PDHMasterId]     INT           NOT NULL,
    [DiagnosisTypeId] INT           NULL,
    [TreatmentTypeId] INT           NULL,
    [DiagnosedTeeth]  VARCHAR (200) NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[PatientDiagnosisHistoryMaster]...';


GO
CREATE TABLE [dbo].[PatientDiagnosisHistoryMaster] (
    [Id]            INT   IDENTITY (1, 1) NOT NULL,
    [PatientId]     INT   NOT NULL,
    [AppointmentId] INT   NOT NULL,
    [Fee]           MONEY NOT NULL,
    [Paid]          MONEY NULL,
    [Balance]       MONEY NULL,
    [Status]        INT   NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[PatientMedicalHistory]...';


GO
CREATE TABLE [dbo].[PatientMedicalHistory] (
    [Id]         INT           IDENTITY (1, 1) NOT NULL,
    [PatientId]  INT           NOT NULL,
    [Question1]  DATETIME      NULL,
    [Question2]  VARCHAR (150) NULL,
    [Question3]  VARCHAR (500) NULL,
    [Question4]  VARCHAR (500) NULL,
    [Question5]  VARCHAR (500) NULL,
    [Question6]  VARCHAR (500) NULL,
    [Question7]  VARCHAR (10)  NULL,
    [Question8]  INT           NULL,
    [Question9]  VARCHAR (500) NULL,
    [Question10] VARCHAR (500) NULL,
    [Question11] VARCHAR (100) NULL,
    [Question12] VARCHAR (500) NULL,
    [Question13] VARCHAR (500) NULL,
    [Question14] VARCHAR (500) NULL,
    [Question15] VARCHAR (100) NULL,
    [Question16] VARCHAR (100) NULL,
    [Question17] VARCHAR (100) NULL,
    [Question18] INT           NULL,
    [Question19] INT           NULL,
    [Status]     INT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[User]...';


GO
CREATE TABLE [dbo].[User] (
    [Id]         INT           IDENTITY (1, 1) NOT NULL,
    [UserTypeId] INT           NOT NULL,
    [Username]   VARCHAR (200) NOT NULL,
    [Password]   VARCHAR (200) NOT NULL,
    [Status]     INT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[ScheduleMaster]...';


GO
CREATE TABLE [dbo].[ScheduleMaster] (
    [Id]        INT  IDENTITY (1, 1) NOT NULL,
    [Date]      DATE NOT NULL,
    [DentistId] INT  NOT NULL,
    [Status]    INT  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[PatientMouth]...';


GO
CREATE TABLE [dbo].[PatientMouth] (
    [Id]          INT IDENTITY (1, 1) NOT NULL,
    [MouthTypeId] INT NULL,
    [PatientId]   INT NULL,
    [Status]      INT NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[CivilStatus]...';


GO
CREATE TABLE [dbo].[CivilStatus] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [Name]        VARCHAR (50)  NULL,
    [Description] VARCHAR (200) NOT NULL,
    [Status]      INT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[TreatmentType]...';


GO
CREATE TABLE [dbo].[TreatmentType] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [Name]        VARCHAR (50)  NOT NULL,
    [Description] VARCHAR (100) NOT NULL,
    [Status]      INT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[Notification]...';


GO
CREATE TABLE [dbo].[Notification] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [UserId]      INT           NOT NULL,
    [Description] VARCHAR (200) NOT NULL,
    [Date]        DATETIME      NOT NULL,
    [Status]      INT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[UserMenu]...';


GO
CREATE TABLE [dbo].[UserMenu] (
    [Id]         INT IDENTITY (1, 1) NOT NULL,
    [UserTypeId] INT NOT NULL,
    [MenuId]     INT NOT NULL,
    [Status]     INT NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[DentalMenu]...';


GO
CREATE TABLE [dbo].[DentalMenu] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [ParentId]    INT           NULL,
    [Name]        VARCHAR (100) NOT NULL,
    [Description] VARCHAR (200) NULL,
    [Url]         VARCHAR (50)  NULL,
    [Status]      INT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[UserInformation]...';


GO
CREATE TABLE [dbo].[UserInformation] (
    [Id]            INT             IDENTITY (1, 1) NOT NULL,
    [UserId]        INT             NOT NULL,
    [FirstName]     VARCHAR (100)   NOT NULL,
    [MiddleName]    VARCHAR (100)   NULL,
    [LastName]      VARCHAR (100)   NOT NULL,
    [Gender]        CHAR (1)        NOT NULL,
    [Height]        DECIMAL (18, 2) NULL,
    [Weight]        DECIMAL (18, 2) NULL,
    [BirthDate]     DATETIME        NOT NULL,
    [Address]       VARCHAR (200)   NULL,
    [CivilStatusId] INT             NULL,
    [Occupation]    VARCHAR (100)   NULL,
    [ContactNo]     VARCHAR (50)    NULL,
    [EmailAddress]  VARCHAR (100)   NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[ScheduleDetail]...';


GO
CREATE TABLE [dbo].[ScheduleDetail] (
    [Id]               INT      IDENTITY (1, 1) NOT NULL,
    [ScheduleMasterId] INT      NOT NULL,
    [FromTime]         TIME (7) NOT NULL,
    [ToTime]           TIME (7) NOT NULL,
    [Status]           INT      NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[Appointment]...';


GO
CREATE TABLE [dbo].[Appointment] (
    [Id]               INT           IDENTITY (1, 1) NOT NULL,
    [PatientId]        INT           NULL,
    [Message]          VARCHAR (500) NOT NULL,
    [ScheduleMasterId] INT           NOT NULL,
    [ScheduleDetailId] INT           NULL,
    [Status]           INT           NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[PatientDentalHistory]...';


GO
CREATE TABLE [dbo].[PatientDentalHistory] (
    [Id]              INT           IDENTITY (1, 1) NOT NULL,
    [PatientId]       INT           NULL,
    [Question1]       VARCHAR (500) NULL,
    [Question2]       VARCHAR (500) NULL,
    [Question3]       VARCHAR (500) NULL,
    [Question4]       INT           NULL,
    [Question5]       VARCHAR (500) NULL,
    [Question6]       VARCHAR (500) NULL,
    [Question7a]      INT           NULL,
    [Question7b]      INT           NULL,
    [Question7c]      INT           NULL,
    [Question7d]      INT           NULL,
    [Question7e]      INT           NULL,
    [Question7f]      INT           NULL,
    [Question7g]      INT           NULL,
    [Question7Others] INT           NULL,
    [Status]          INT           NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [dbo].[PatientTooth]...';


GO
CREATE TABLE [dbo].[PatientTooth] (
    [Id]             INT IDENTITY (1, 1) NOT NULL,
    [PatientMouthId] INT NULL,
    [Position]       INT NULL,
    [XAxis]          INT NULL,
    [YAxis]          INT NULL,
    [Width]          INT NULL,
    [Height]         INT NULL,
    [rotation]       INT NULL,
    [ImageUrlId]     INT NULL,
    [Status]         INT NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating Default Constraint on [dbo].[Message]....';


GO
ALTER TABLE [dbo].[Message]
    ADD DEFAULT 0 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[ImageUrl]....';


GO
ALTER TABLE [dbo].[ImageUrl]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[Tooth]....';


GO
ALTER TABLE [dbo].[Tooth]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[MouthType]....';


GO
ALTER TABLE [dbo].[MouthType]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[DiagnosisType]....';


GO
ALTER TABLE [dbo].[DiagnosisType]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[UserType]....';


GO
ALTER TABLE [dbo].[UserType]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[PatientDiagnosisHistoryMaster]....';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[PatientMedicalHistory]....';


GO
ALTER TABLE [dbo].[PatientMedicalHistory]
    ADD DEFAULT 0 FOR [Question8];


GO
PRINT N'Creating Default Constraint on [dbo].[PatientMedicalHistory]....';


GO
ALTER TABLE [dbo].[PatientMedicalHistory]
    ADD DEFAULT 0 FOR [Question18];


GO
PRINT N'Creating Default Constraint on [dbo].[PatientMedicalHistory]....';


GO
ALTER TABLE [dbo].[PatientMedicalHistory]
    ADD DEFAULT 0 FOR [Question19];


GO
PRINT N'Creating Default Constraint on [dbo].[PatientMedicalHistory]....';


GO
ALTER TABLE [dbo].[PatientMedicalHistory]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[User]....';


GO
ALTER TABLE [dbo].[User]
    ADD DEFAULT 0 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[ScheduleMaster]....';


GO
ALTER TABLE [dbo].[ScheduleMaster]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[PatientMouth]....';


GO
ALTER TABLE [dbo].[PatientMouth]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[CivilStatus]....';


GO
ALTER TABLE [dbo].[CivilStatus]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[TreatmentType]....';


GO
ALTER TABLE [dbo].[TreatmentType]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[Notification]....';


GO
ALTER TABLE [dbo].[Notification]
    ADD DEFAULT 0 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[UserMenu]....';


GO
ALTER TABLE [dbo].[UserMenu]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[DentalMenu]....';


GO
ALTER TABLE [dbo].[DentalMenu]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[ScheduleDetail]....';


GO
ALTER TABLE [dbo].[ScheduleDetail]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[PatientDentalHistory]....';


GO
ALTER TABLE [dbo].[PatientDentalHistory]
    ADD DEFAULT 0 FOR [Question4];


GO
PRINT N'Creating Default Constraint on [dbo].[PatientDentalHistory]....';


GO
ALTER TABLE [dbo].[PatientDentalHistory]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating Default Constraint on [dbo].[PatientTooth]....';


GO
ALTER TABLE [dbo].[PatientTooth]
    ADD DEFAULT 1 FOR [Status];


GO
PRINT N'Creating FK_User_SenderId...';


GO
ALTER TABLE [dbo].[Message]
    ADD CONSTRAINT [FK_User_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [dbo].[User] ([Id]);


GO
PRINT N'Creating FK_User_ReceiverId...';


GO
ALTER TABLE [dbo].[Message]
    ADD CONSTRAINT [FK_User_ReceiverId] FOREIGN KEY ([ReceiverId]) REFERENCES [dbo].[User] ([Id]);


GO
PRINT N'Creating FK_Tooth_MouthTypeId...';


GO
ALTER TABLE [dbo].[Tooth]
    ADD CONSTRAINT [FK_Tooth_MouthTypeId] FOREIGN KEY ([MouthTypeId]) REFERENCES [dbo].[MouthType] ([Id]);


GO
PRINT N'Creating FK_Tooth_ImageUrlId...';


GO
ALTER TABLE [dbo].[Tooth]
    ADD CONSTRAINT [FK_Tooth_ImageUrlId] FOREIGN KEY ([ImageUrlId]) REFERENCES [dbo].[ImageUrl] ([Id]) ON DELETE SET NULL;


GO
PRINT N'Creating FK_MouthType_ImageUrlId...';


GO
ALTER TABLE [dbo].[MouthType]
    ADD CONSTRAINT [FK_MouthType_ImageUrlId] FOREIGN KEY ([ImageUrlId]) REFERENCES [dbo].[ImageUrl] ([Id]) ON DELETE SET NULL;


GO
PRINT N'Creating FK_PatientDiagnosisHistoryDetail_PDHMasterId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryDetail]
    ADD CONSTRAINT [FK_PatientDiagnosisHistoryDetail_PDHMasterId] FOREIGN KEY ([PDHMasterId]) REFERENCES [dbo].[PatientDiagnosisHistoryMaster] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_PatientDiagnosisHistoryDetail_DiagnosisTypeId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryDetail]
    ADD CONSTRAINT [FK_PatientDiagnosisHistoryDetail_DiagnosisTypeId] FOREIGN KEY ([DiagnosisTypeId]) REFERENCES [dbo].[DiagnosisType] ([Id]) ON DELETE SET NULL;


GO
PRINT N'Creating FK_PatientDiagnosisHistoryDetail_TreatmentTypeId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryDetail]
    ADD CONSTRAINT [FK_PatientDiagnosisHistoryDetail_TreatmentTypeId] FOREIGN KEY ([TreatmentTypeId]) REFERENCES [dbo].[TreatmentType] ([Id]) ON DELETE SET NULL;


GO
PRINT N'Creating FK_PatientDiagnosisHistoryMaster_PatientId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster]
    ADD CONSTRAINT [FK_PatientDiagnosisHistoryMaster_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[User] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_PatientDiagnosisHistoryMaster_AppointmentId...';


GO
ALTER TABLE [dbo].[PatientDiagnosisHistoryMaster]
    ADD CONSTRAINT [FK_PatientDiagnosisHistoryMaster_AppointmentId] FOREIGN KEY ([AppointmentId]) REFERENCES [dbo].[Appointment] ([Id]);


GO
PRINT N'Creating FK_PatientMedicalHistory_PatientId...';


GO
ALTER TABLE [dbo].[PatientMedicalHistory]
    ADD CONSTRAINT [FK_PatientMedicalHistory_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[User] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_User_UserTypeId...';


GO
ALTER TABLE [dbo].[User]
    ADD CONSTRAINT [FK_User_UserTypeId] FOREIGN KEY ([UserTypeId]) REFERENCES [dbo].[UserType] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_ScheduleMaster_DentistId...';


GO
ALTER TABLE [dbo].[ScheduleMaster]
    ADD CONSTRAINT [FK_ScheduleMaster_DentistId] FOREIGN KEY ([DentistId]) REFERENCES [dbo].[UserInformation] ([Id]);


GO
PRINT N'Creating FK_PatientMouth_MouthTypeId...';


GO
ALTER TABLE [dbo].[PatientMouth]
    ADD CONSTRAINT [FK_PatientMouth_MouthTypeId] FOREIGN KEY ([MouthTypeId]) REFERENCES [dbo].[MouthType] ([Id]) ON DELETE SET NULL;


GO
PRINT N'Creating FK_PatientMouth_PatientId...';


GO
ALTER TABLE [dbo].[PatientMouth]
    ADD CONSTRAINT [FK_PatientMouth_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[UserInformation] ([Id]) ON DELETE SET NULL;


GO
PRINT N'Creating Fk_Notification_UserId...';


GO
ALTER TABLE [dbo].[Notification]
    ADD CONSTRAINT [Fk_Notification_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[User] ([Id]);


GO
PRINT N'Creating Fk_UserMenu_UserTypeId...';


GO
ALTER TABLE [dbo].[UserMenu]
    ADD CONSTRAINT [Fk_UserMenu_UserTypeId] FOREIGN KEY ([UserTypeId]) REFERENCES [dbo].[UserType] ([Id]);


GO
PRINT N'Creating Fk_UserMenu_MenuId...';


GO
ALTER TABLE [dbo].[UserMenu]
    ADD CONSTRAINT [Fk_UserMenu_MenuId] FOREIGN KEY ([MenuId]) REFERENCES [dbo].[DentalMenu] ([Id]);


GO
PRINT N'Creating FK_PatientInformation_PatientId...';


GO
ALTER TABLE [dbo].[UserInformation]
    ADD CONSTRAINT [FK_PatientInformation_PatientId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[User] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_PatientInformation_CivilStatusId...';


GO
ALTER TABLE [dbo].[UserInformation]
    ADD CONSTRAINT [FK_PatientInformation_CivilStatusId] FOREIGN KEY ([CivilStatusId]) REFERENCES [dbo].[CivilStatus] ([Id]) ON DELETE SET NULL;


GO
PRINT N'Creating FK_ScheduleDetail_ScheduLeMasterId...';


GO
ALTER TABLE [dbo].[ScheduleDetail]
    ADD CONSTRAINT [FK_ScheduleDetail_ScheduLeMasterId] FOREIGN KEY ([ScheduleMasterId]) REFERENCES [dbo].[ScheduleMaster] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Appointment_PatientId...';


GO
ALTER TABLE [dbo].[Appointment]
    ADD CONSTRAINT [FK_Appointment_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[User] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Appointment_ScheduleMasterId...';


GO
ALTER TABLE [dbo].[Appointment]
    ADD CONSTRAINT [FK_Appointment_ScheduleMasterId] FOREIGN KEY ([ScheduleMasterId]) REFERENCES [dbo].[ScheduleMaster] ([Id]);


GO
PRINT N'Creating FK_Appointment_ScheduleDetailId...';


GO
ALTER TABLE [dbo].[Appointment]
    ADD CONSTRAINT [FK_Appointment_ScheduleDetailId] FOREIGN KEY ([ScheduleDetailId]) REFERENCES [dbo].[ScheduleDetail] ([Id]);


GO
PRINT N'Creating FK_PatientDentalHistory_PatientId...';


GO
ALTER TABLE [dbo].[PatientDentalHistory]
    ADD CONSTRAINT [FK_PatientDentalHistory_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[User] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_PatientTooth_PatientMouthId...';


GO
ALTER TABLE [dbo].[PatientTooth]
    ADD CONSTRAINT [FK_PatientTooth_PatientMouthId] FOREIGN KEY ([PatientMouthId]) REFERENCES [dbo].[PatientMouth] ([Id]) ON DELETE SET NULL;


GO
PRINT N'Creating FK_PatientTooth_ImageUrlId...';


GO
ALTER TABLE [dbo].[PatientTooth]
    ADD CONSTRAINT [FK_PatientTooth_ImageUrlId] FOREIGN KEY ([ImageUrlId]) REFERENCES [dbo].[ImageUrl] ([Id]);


GO
PRINT N'Creating [dbo].[V_UsersList]...';


GO
CREATE VIEW [dbo].[V_UsersList]
	AS SELECT	u.Id,
				u.Username,
				u.Password,
				u.UserTypeId,
				u.Status,
				p.Address,
				p.BirthDate,
				p.CivilStatusId,
				p.ContactNo,
				p.EmailAddress,
				p.FirstName,
				p.Gender,
				p.Height,
				p.LastName,
				p.MiddleName,
				p.Occupation,
				p.UserId,
				p.Weight
	FROM [User] as u INNER JOIN [UserInformation] as p ON u.Id = p.UserId WHERE u.Status = 1
GO
PRINT N'Creating [dbo].[V_UserMenu]...';


GO
CREATE VIEW [dbo].[V_UserMenu]
	AS SELECT	dm.Id,
				dm.Name,
				dm.Description,
				dm.ParentId,
				dm.Url,
				um.UserTypeId
	FROM [UserMenu] um INNER JOIN [DentalMenu] dm ON um.MenuId = dm.Id WHERE um.Status = 1
GO
-- Refactoring step to update target server with deployed transaction logs

IF OBJECT_ID(N'dbo.__RefactorLog') IS NULL
BEGIN
    CREATE TABLE [dbo].[__RefactorLog] (OperationKey UNIQUEIDENTIFIER NOT NULL PRIMARY KEY)
    EXEC sp_addextendedproperty N'microsoft_database_tools_support', N'refactoring log', N'schema', N'dbo', N'table', N'__RefactorLog'
END
GO
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '8d2b0cc4-9b43-4007-8f1b-3c429b04d5bc')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('8d2b0cc4-9b43-4007-8f1b-3c429b04d5bc')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'a0bf6e91-03c2-4c46-8df3-560709f77270')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('a0bf6e91-03c2-4c46-8df3-560709f77270')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'b669bb9a-cff7-4c2c-866f-f432acba12be')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('b669bb9a-cff7-4c2c-866f-f432acba12be')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '38ac23d1-e709-43b8-b326-d115c8d05b16')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('38ac23d1-e709-43b8-b326-d115c8d05b16')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'dbf7c618-3d95-4e64-a25d-16ff82a88061')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('dbf7c618-3d95-4e64-a25d-16ff82a88061')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'bf5e31a6-4aeb-45e0-aa2f-5c667dbf879b')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('bf5e31a6-4aeb-45e0-aa2f-5c667dbf879b')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'db1aad91-217d-4e35-8cc0-63c50f467c7f')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('db1aad91-217d-4e35-8cc0-63c50f467c7f')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '4522fc6c-df98-43e5-91f9-11ad3c7bfefb')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('4522fc6c-df98-43e5-91f9-11ad3c7bfefb')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '5f1d0114-a4bc-49ca-bb9c-a311c0bdeb02')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('5f1d0114-a4bc-49ca-bb9c-a311c0bdeb02')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '9eddd5bc-f06b-4259-8fab-153a922ee837')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('9eddd5bc-f06b-4259-8fab-153a922ee837')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '237d0f62-1294-4437-94db-851665c481c1')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('237d0f62-1294-4437-94db-851665c481c1')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'e72f84f9-4eba-4d8f-9215-11ee4b64ea68')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('e72f84f9-4eba-4d8f-9215-11ee4b64ea68')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'dc23c009-1948-4aa9-9f34-2d1b592a596f')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('dc23c009-1948-4aa9-9f34-2d1b592a596f')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '85457814-78f6-41f2-811f-5a930fea9e95')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('85457814-78f6-41f2-811f-5a930fea9e95')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '3a96fd3e-b1c7-4d78-bfd2-58270bd7a624')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('3a96fd3e-b1c7-4d78-bfd2-58270bd7a624')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'af6f0cfd-31f2-4677-bfcc-5bfa28380a20')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('af6f0cfd-31f2-4677-bfcc-5bfa28380a20')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'eee151c3-cf76-4393-bf14-acf588458bfa')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('eee151c3-cf76-4393-bf14-acf588458bfa')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'a4a74677-0197-4e11-9d83-2dfaa2f603b2')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('a4a74677-0197-4e11-9d83-2dfaa2f603b2')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '652f832c-ab91-498e-9269-33d52e446506')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('652f832c-ab91-498e-9269-33d52e446506')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'df2b89ad-3f58-482c-a644-66ec865959cd')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('df2b89ad-3f58-482c-a644-66ec865959cd')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'b8315f3f-16ff-4ca3-9194-96ffd5f81e31')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('b8315f3f-16ff-4ca3-9194-96ffd5f81e31')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '967c784b-23ab-4d4b-9876-7bc85f925e01')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('967c784b-23ab-4d4b-9876-7bc85f925e01')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '56732a5e-ee72-42fa-b8ec-57f1f6b5bd74')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('56732a5e-ee72-42fa-b8ec-57f1f6b5bd74')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '4aeee5c5-5576-419e-be4b-e666b1326838')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('4aeee5c5-5576-419e-be4b-e666b1326838')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'a4511c76-919d-4c05-bd9f-e6de3bcc52f7')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('a4511c76-919d-4c05-bd9f-e6de3bcc52f7')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'f78c5554-57cb-42da-b94f-d201f3cd632f')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('f78c5554-57cb-42da-b94f-d201f3cd632f')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '9a487cd2-0d5e-4fc9-8e99-7ee77693eff2')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('9a487cd2-0d5e-4fc9-8e99-7ee77693eff2')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'ff3b172a-d7e9-476d-b83f-704b20f5082a')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('ff3b172a-d7e9-476d-b83f-704b20f5082a')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '2d1c59e7-49d1-4f4e-9e90-0c9227cb57e0')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('2d1c59e7-49d1-4f4e-9e90-0c9227cb57e0')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'c6b576f9-14c6-4caf-874a-1433ac62af5a')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('c6b576f9-14c6-4caf-874a-1433ac62af5a')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'fbc7fd80-0e0a-4246-a2a3-2eb70b4447d8')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('fbc7fd80-0e0a-4246-a2a3-2eb70b4447d8')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'aa68b338-76dc-442a-bfca-53789a7ebd58')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('aa68b338-76dc-442a-bfca-53789a7ebd58')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '86a9897d-e00f-41c7-b29b-18686ba2dbde')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('86a9897d-e00f-41c7-b29b-18686ba2dbde')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '388bac8b-2489-4355-8903-793de1b511ac')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('388bac8b-2489-4355-8903-793de1b511ac')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '74a727db-1547-4fcf-a4ad-1d482d617c28')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('74a727db-1547-4fcf-a4ad-1d482d617c28')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '97a514d4-c2e7-4dc7-a32e-4d51b774f791')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('97a514d4-c2e7-4dc7-a32e-4d51b774f791')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '318d7847-5889-4b61-9c7c-3da834c31c1a')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('318d7847-5889-4b61-9c7c-3da834c31c1a')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '94d4cbd2-8b2e-4901-a8ed-9c91c106076c')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('94d4cbd2-8b2e-4901-a8ed-9c91c106076c')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'c2fb1b46-6ba4-43ed-b1a1-abd72c2d4b8c')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('c2fb1b46-6ba4-43ed-b1a1-abd72c2d4b8c')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '928c8ad2-6ef9-4020-a414-e992a286f900')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('928c8ad2-6ef9-4020-a414-e992a286f900')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '0676fde1-0b60-4625-94f3-aae25657374d')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('0676fde1-0b60-4625-94f3-aae25657374d')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'af34da0f-24c8-48d8-9b79-17008e7b7d72')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('af34da0f-24c8-48d8-9b79-17008e7b7d72')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '2f68d75b-2906-43e1-8343-94e5fd6bd460')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('2f68d75b-2906-43e1-8343-94e5fd6bd460')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '8c0d3bcb-fedc-4d52-92b9-28894e82d675')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('8c0d3bcb-fedc-4d52-92b9-28894e82d675')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '8f91b208-0948-4084-9a6f-309b9504aa13')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('8f91b208-0948-4084-9a6f-309b9504aa13')
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = '8c5057e6-6667-45eb-ab0d-b9fc9f552ef8')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('8c5057e6-6667-45eb-ab0d-b9fc9f552ef8')

GO

GO
DECLARE @VarDecimalSupported AS BIT;

SELECT @VarDecimalSupported = 0;

IF ((ServerProperty(N'EngineEdition') = 3)
    AND (((@@microsoftversion / power(2, 24) = 9)
          AND (@@microsoftversion & 0xffff >= 3024))
         OR ((@@microsoftversion / power(2, 24) = 10)
             AND (@@microsoftversion & 0xffff >= 1600))))
    SELECT @VarDecimalSupported = 1;

IF (@VarDecimalSupported > 0)
    BEGIN
        EXECUTE sp_db_vardecimal_storage_format N'$(DatabaseName)', 'ON';
    END


GO
ALTER DATABASE [$(DatabaseName)]
    SET MULTI_USER 
    WITH ROLLBACK IMMEDIATE;


GO
PRINT N'Update complete.';


GO
