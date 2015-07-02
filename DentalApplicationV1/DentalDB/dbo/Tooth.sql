CREATE TABLE [dbo].[Tooth]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [MouthTypeId] INT NULL, 
    [Position] NCHAR(10) NULL, 
    [XAxis] INT NULL, 
    [YAxis] INT NULL, 
    [Width] INT NULL, 
    [Height] INT NULL, 
    [rotation] INT NULL, 
    [ImageUrlId] INT NULL, 
    [Status] INT NULL DEFAULT 1,
	CONSTRAINT [FK_Tooth_MouthTypeId] FOREIGN KEY ([MouthTypeId]) REFERENCES [MouthType]([Id]),
	CONSTRAINT [FK_Tooth_ImageUrlId] FOREIGN KEY ([ImageUrlId]) REFERENCES [ImageUrl]([Id]) ON DELETE SET NULL
)
