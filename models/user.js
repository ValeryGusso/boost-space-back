import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	passwordHash: {
		type: String,
		required: true,
	},
	isAdmin: {
		type: Boolean,
		required: true,
	},
	group: {
    type: Number,
		required: true,
	},
  role: String,
	avatar: String,
	characters: {
		main: {
			class: String,
			key: String,
			lvl: String,
		},
		first: {
			class: String,
			key: String,
			lvl: String,
		},
		second: {
			class: String,
			key: String,
			lvl: String,
		},
		third: {
			class: String,
			key: String,
			lvl: String,
		},
	},
}, {
  timestamps: true
})

export default mongoose.model('User', UserSchema)
