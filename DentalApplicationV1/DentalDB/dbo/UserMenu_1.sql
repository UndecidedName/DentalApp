CREATE TABLE [dbo].[UserMenu]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [UserTypeId] INT NOT NULL, 
    [MenuId] INT NOT NULL, 
    [Status] INT NOT NULL DEFAULT 1,
	CONSTRAINT [Fk_UserMenu_UserTypeId] FOREIGN KEY ([UserTypeId]) REFERENCES [UserType]([Id]),
	CONSTRAINT [Fk_UserMenu_MenuId] FOREIGN KEY ([MenuId]) REFERENCES [DentalMenu]([Id])
)
