// Config file that contains some non sensitive data that can be shared accross whole project

const config = {
	saltRounds: 10,
	typingTextDuration: 5000,
	typingDurationForResend: 7000,
	pages: {
		home: {
			minPermission: 5,
			commentStaleTime: 5 * 60 * 1000,
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
	jwtTokenExpiration: 1 * 24 * 60 * 60, // 1 day
	placeholder: {
		credentials: {
			email: {
				label: 'Email',
				type: 'email',
				placeholder: 'shahar@emplifi.io',
			},
			password: { label: 'Password', type: 'password' },
		},
	},
	validation: {
		emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	},
}

export default config
