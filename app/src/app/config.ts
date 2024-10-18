// Config file that contains some non sensitive data that can be shared accross whole project

const config = {
	SALT_ROUNDS: 10,
	pages: {
		home: {
			minPermission: 0,
		},
		myAccount: {
			minPermission: 10,
		},
		createPost: {
			minPermission: 30,
		},
		createCategory: {
			minPermission: 30,
		},
		manageUsers: {
			minPermission: 80,
		},
	},
}

export default config
