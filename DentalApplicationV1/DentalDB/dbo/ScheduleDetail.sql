CREATE TABLE [dbo].[ScheduleDetail]
(
	[Id] INT NOT NULL PRIMARY KEY, 
    [ScheduleMasterId] INT NOT NULL, 
    [From] TIME NOT NULL, 
    [To] TIME NOT NULL, 
    [Status] INT NOT NULL,
	CONSTRAINT [FK_ScheduleDetail_ScheduLeMasterId] FOREIGN KEY ([ScheduLeMasterId]) REFERENCES [ScheduleMaster](Id)
)
