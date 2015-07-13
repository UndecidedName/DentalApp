CREATE VIEW [dbo].[V_UserMenu]
	AS SELECT	dm.Id,
				dm.Name,
				dm.Description,
				dm.ParentId,
				dm.Url,
				um.UserTypeId
	FROM [UserMenu] um INNER JOIN [DentalMenu] dm ON um.MenuId = dm.Id WHERE um.Status = 1
