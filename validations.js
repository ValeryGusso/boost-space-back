import { body } from 'express-validator'

export const regValidation = [
	body('name', 'Имя должно состоять из 3х и более символов').isLength({ min: 3 }),
	body('password', 'Пароль не может быть короче 5 символов').isLength({ min: 5 }),
	body('invite', 'Код-приглашение указан неверно').isLength({min: 30})
]

export const orderValidation = [
	body('date').isDate(),
	body('type').isLength({min: 2}),
	body('group').isArray(),
	body('price').isNumeric(),
	body('tax').isNumeric(),
	body('discription').optional().isLength({min: 5}),
	body('orderLink').optional().isURL(),
	body('priceLink').optional().isURL(),
]

export const periodValidation = [
	body('start').isDate(),
	body('end').isDate(),
	body('data').isArray().isLength({min: 1}),
	body('tax').isObject(),
	body('orders').isObject(),
]