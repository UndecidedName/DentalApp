CREATE VIEW [dbo].[V_UserMenu]
	AS SELECT	TOP (100) PERCENT dm.Id,
				dm.Name,
				dm.Description,
				dm.ParentId,
				dm.Url,
				dm.SeqNo,
				um.UserTypeId
	FROM [UserMenu] um INNER JOIN [DentalMenu] dm ON um.MenuId = dm.Id WHERE um.Status = 1 ORDER BY dm.SeqNo
