import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import UserModel from '../models/user.js'

export let inviteToken = 'none'

export const login = async (req, res) => {
	try {
		const user = await UserModel.findOne({ name: req.body.name })

		if (!user) {
			return res.status(404).json({
				message: 'Неверное имя пользователя или пароль',
			})
		}

		const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)

		if (!isValidPass) {
			return res.status(404).json({
				message: 'Неверное имя пользователя или пароль',
			})
		}

		const token = jwt.sign(
			{
				id: user._id,
				name: user._doc.name,
				isAdmin: user._doc.isAdmin,
				avatar: user.avatar,
			},
			'tokenKey',
			{
				expiresIn: '30d',
			}
		)

		const { passHash, ...userData } = user._doc
		res.json({ ...userData, token })
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Не удалось авторизоваться',
		})
	}
}

export const auth = async (req, res) => {
	try {
		const user = await UserModel.findById(req.userInfo.id)

		if (!user) {
			return res.status(404).json({
				message: 'Пользователь не найден',
			})
		}
		const { passwordHash, ...userData } = user._doc
		res.json(userData)
	} catch (err) {
		return res.status(500).json({
			message: 'В доступе отказано',
		})
	}
}

export const reg = async (req, res) => {
	try {
		const invite = req.body.invite

		if (invite !== inviteToken) {
			return res.status(500).json({
				message: 'Код-приглашение недействителен',
			})
		}

		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			return res.status(400).json(errors.array())
		}

		const decoded = jwt.verify(invite, 'regKey')

		if (decoded.group >= 0) {
			const password = req.body.password
			const salt = await bcrypt.genSalt(10)
			const passHash = await bcrypt.hash(password, salt)

			const doc = new UserModel({
				name: req.body.name,
				passwordHash: passHash,
				isAdmin: false,
				group: decoded.group,
				role: '',
				avatar: '',
				characters: {
					main: {
						class: '',
						key: '',
						lvl: '---',
					},
					first: {
						class: '',
						key: '',
						lvl: '---',
					},
					second: {
						class: '',
						key: '',
						lvl: '---',
					},
					third: {
						class: '',
						key: '',
						lvl: '---',
					},
				},
			})

			const user = await doc.save()

			const token = jwt.sign(
				{
					id: user._id,
					name: user.name,
					isAdmin: user.isAdmin,
				},
				'tokenKey',
				{
					expiresIn: '30d',
				}
			)

			inviteToken = 'none'
			const { passwordHash, ...userData } = user._doc
			return res.json({ ...userData, token })
		}
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось зарегистрироваться',
			errors: err,
		})
	}
}

export const getAllUsers = async (req, res) => {
	try {
		const data = await UserModel.find()
		const me = await UserModel.findById(req.userInfo.id)
		const users = []
		const groupCounter = new Set()
		let count = 0

		data.map(el => {
			users.push({ id: el._id, name: el.name, group: el.group, role: el.role })
			if (el.group === 0) {
				count++
			}
		})
		data.map(el => groupCounter.add(el.group))
		data.sort((a, b) => (a.role > b.role ? -1 : 1))
		data.sort((a, b) => (a.group < b.group ? -1 : 1))
		users.sort((a, b) => (a.role > b.role ? -1 : 1))
		users.sort((a, b) => (a.group < b.group ? -1 : 1))

		const reserve = users.splice(0, count)
		reserve.map(el => users.push(el))


		const sortGroup = [...groupCounter]
		sortGroup.sort()
		const nullGroup = sortGroup.shift()
		sortGroup.push(nullGroup)

		res.json({ users, data, me, groupCounter: sortGroup })
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось загрузить пользователей',
		})
	}
}

export const decodeToken = async (req, res) => {
	try {
		const token = (req.body.token || '').replace(/Bearer\s?/, '')
		const decoded = jwt.verify(token, 'tokenKey')

		res.json({
			id: decoded.id,
			name: decoded.name,
			isAdmin: decoded.isAdmin,
			avatar: decoded.avatar,
		})
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось расшифровать токен',
		})
	}
}

export const createInvite = async (req, res) => {
	try {
		const token = jwt.sign(
			{
				group: req.body.group,
			},
			'regKey',
			{
				expiresIn: '5m',
			}
		)

		inviteToken = token
		res.json(token)
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось создать приглашение',
		})
	}
}

export const updateUser = async (req, res) => {
	try {
		const id = req.userInfo.id

		const user = await UserModel.findById(id)

		const updatedCharacters = { ...user.characters }
		const oldName = user.name
		const oldAvatar = user.avatar
		const oldGroup = user.group
		const oldRole = user.role
		const oldPass = user.passwordHash
		let passHash = undefined
		let newPass = 0

		if (req.body.main) {
			updatedCharacters.main.class = req.body.main
		}

		if (req.body.first) {
			updatedCharacters.first.class = req.body.first
		}

		if (req.body.second) {
			updatedCharacters.second.class = req.body.second
		}

		if (req.body.third) {
			updatedCharacters.third.class = req.body.third
		}

		if (req.body.password.length > 4) {
			const password = req.body.password
			newPass = password
			const salt = await bcrypt.genSalt(10)
			passHash = await bcrypt.hash(password, salt)
		}

		await UserModel.findByIdAndUpdate(id, {
			name: req.body.name || oldName,
			avatar: req.body.avatar || oldAvatar,
			group: req.body.group > -1 ? req.body.group : oldGroup,
			role: req.body.role || oldRole,
			characters: updatedCharacters,
			passwordHash: passHash || oldPass,
		})

		res.json({
			success: true
		})
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось обновить информацию',
		})
	}
}

export const updateKeys = async (req, res) => {
	try {
		const id = req.userInfo.id

		const user = await UserModel.findById(id)

		const updatedCharacters = { ...user.characters }

		if (req.body.main) {
			updatedCharacters.main.key = req.body.main.key || updatedCharacters.main.key
			updatedCharacters.main.lvl = req.body.main.lvl || updatedCharacters.main.lvl
		}

		if (req.body.first) {
			updatedCharacters.first.key = req.body.first.key || updatedCharacters.first.key
			updatedCharacters.first.lvl = req.body.first.lvl || updatedCharacters.first.lvl
		}

		if (req.body.second) {
			updatedCharacters.second.key = req.body.second.key || updatedCharacters.second.key
			updatedCharacters.second.lvl = req.body.second.lvl || updatedCharacters.second.lvl
		}

		if (req.body.third) {
			updatedCharacters.third.key = req.body.third.key || updatedCharacters.third.key
			updatedCharacters.third.lvl = req.body.third.lvl || updatedCharacters.third.lvl
		}

		await UserModel.findByIdAndUpdate(id, {
			characters: updatedCharacters,
		})

		res.json({
			success: true,
		})
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось обновить информацию о ключах',
		})
	}
}
