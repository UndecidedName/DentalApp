﻿CREATE TABLE [dbo].[User]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [UserTypeId] INT NOT NULL,
    [Username] VARCHAR(200) NOT NULL, 
    [Password] VARCHAR(200) NOT NULL, 
	[Url] VARCHAR(200) NULL,
    [RegistrationDate] DATE NOT NULL, 
    [Status] INT NOT NULL DEFAULT 0,
    CONSTRAINT [FK_User_UserTypeId] FOREIGN KEY ([UserTypeId]) REFERENCES [UserType]([Id]) ON DELETE CASCADE,
)
