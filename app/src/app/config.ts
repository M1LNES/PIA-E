// Config file that contains some non sensitive data that can be shared accross whole project

const config = {
	saltRounds: 10,
	typingTextDuration: 5000,
	everyXthChar: 50,
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
