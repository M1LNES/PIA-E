export class AppError extends Error {
	statusCode: number
	description: string

	constructor(message: string, statusCode: number, description: string) {
		super(message)
		this.statusCode = statusCode
		this.description = description
		this.name = 'AppError'

		// Zachytíme stack trace, pokud je tato funkce k dispozici
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AppError)
		}
	}
}
