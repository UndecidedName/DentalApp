﻿CREATE TABLE [dbo].[UserType]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
    [Name] VARCHAR(20) NOT NULL,
    [Description] VARCHAR(100) NOT NULL, 
    [Status] INT NULL DEFAULT 1, 
)
