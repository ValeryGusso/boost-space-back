import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'

dotenv.config()

export default (req, res, next) => {
	const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')

	if (token) {
		try {
			const decoded = jwt.verify(token, process.env.TOKEN_KEY)

			req.userInfo = {
				id: decoded.id,
				name: decoded.name,
				isAdmin: decoded.isAdmin,
			}
			next()
		} catch (err) {
			return res.status(403).json({
				message: 'Нет доступа',
			})
		}
	} else {
		return res.status(403).json({
			message: 'Нет доступа',
		})
	}
}
