import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { orderValidation, periodValidation, regValidation } from './validations.js'
import checkAuth from './utils/checkAuth.js'
import { auth, createInvite, decodeToken, getAllUsers, login, reg, updateKeys, updateUser } from './controllers/userControllers.js'
import { getAll, getOne, create, update, remove, getPeriod } from './controllers/orderControllers.js'
import { createPeriod, getAllPeriods, isPaid } from './controllers/periodController.js'

mongoose
	.connect('mongodb+srv://admin:admin314159@boostspacedb.5gedsju.mongodb.net/boostspace?retryWrites=true&w=majority')
	.then(() => console.log('Connected with DB up'))
	.catch(err => console.log('Connect with DB failed', err))

const app = express()
app.use(cors())
app.use(express.json())

// Авторизация
app.post('/login', login)
app.get('/auth', checkAuth, auth)
app.post('/reg', regValidation, reg)
app.get('/users', checkAuth, getAllUsers)
app.post('/user', checkAuth, updateUser)
app.post('/user/keys', checkAuth, updateKeys)
app.post('/token', decodeToken)
app.post('/invite', createInvite)

// Взаимодействие с заказами
app.get('/orders', checkAuth, getAll)
app.get('/orders/:id', checkAuth, getOne)
app.post('/orders/period', checkAuth, getPeriod)
app.post('/orders', checkAuth, orderValidation, create)
app.patch('/orders/:id', checkAuth, orderValidation, update)
app.delete('/orders/:id', checkAuth, remove)

// Работа с периодами
app.get('/period', checkAuth, getAllPeriods)
app.post('/period', periodValidation, checkAuth, createPeriod)
app.post('/ispaid', checkAuth, isPaid)

app.listen(666, err => {
	if (err) {
		return console.log('Server faled: ', err)
	}
	console.log('Server started')
})