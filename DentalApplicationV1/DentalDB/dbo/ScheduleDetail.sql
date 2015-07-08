CREATE TABLE [dbo].[ScheduleDetail]
(
	[Id] INT NOT NULL PRIMARY KEY, 
    [ScheduleMasterId] INT NOT NULL, 
    [FromTime] TIME NOT NULL, 
    [ToTime] TIME NOT NULL, 
    [Status] INT NOT NULL DEFAULT 1
	--CONSTRAINT [FK_ScheduleDetail_ScheduLeMasterId] FOREIGN KEY ([ScheduLeMasterId]) REFERENCES [ScheduleMaster](Id)
)
