type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogData {
	[key: string]: unknown
}

// Environment variable to set the minimum log level (default is 'debug' for development)
const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'debug'

// Define the order of log levels to determine logging threshold
const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']

function formatTimestamp(): string {
	const date = new Date()
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	const seconds = String(date.getSeconds()).padStart(2, '0')

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Logs a message with a specified log level, route, and additional data.
 * @param level - The severity level of the log ('debug', 'info', 'warn', 'error').
 * @param route - The route or function name where the log is generated.
 * @param message - The log message.
 * @param data - Additional data to include in the log.
 */
export const log = (
	level: LogLevel,
	route: string,
	message: string,
	data: LogData = {}
): void => {
	const timestamp = formatTimestamp()

	// Only log if the level is above or equal to the current LOG_LEVEL threshold
	if (levels.indexOf(level) >= levels.indexOf(LOG_LEVEL)) {
		const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${route}] ${message}`

		switch (level) {
			case 'error':
				console.error(logMessage, data)
				break
			case 'warn':
				console.warn(logMessage, data)
				break
			case 'info':
				console.log(logMessage, data)
				break
			case 'debug':
				console.debug(logMessage, data)
				break
			default:
				console.log(logMessage, data) // Fallback for unexpected levels
		}
	}
}
