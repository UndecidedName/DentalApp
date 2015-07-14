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
				p.Weight
	FROM [User] as u INNER JOIN [UserInformation] as p ON u.Id = p.UserId WHERE u.Status = 1
