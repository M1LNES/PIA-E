// Config file that contains some non sensitive data that can be shared accross whole project

const config = {
	SALT_ROUNDS: 10,
	roles: {
		admin: 'admin',
		writer: 'writer',
		reader: 'reader',
	},
}

export default config
