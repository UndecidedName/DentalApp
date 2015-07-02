CREATE TABLE [dbo].[MouthType]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
	[Name] VARCHAR(50) NOT NULL, 
    [Description] VARCHAR(100) NOT NULL, 
    [ImageUrlId] INT NULL,
    [Status] INT NOT NULL DEFAULT 1,
    CONSTRAINT [FK_MouthType_ImageUrlId] FOREIGN KEY ([ImageUrlId]) REFERENCES [ImageUrl]([Id]) ON DELETE SET NULL
)
