/**
 * `LoadingSpinner` is a simple loading indicator that displays a spinning circle.
 * It centers the spinner on the screen and animates it with a spinning effect.
 *
 * @returns {JSX.Element} - A loading spinner centered on the screen.
 */

const LoadingSpinner = () => {
	return (
		<div className="flex justify-center items-center h-screen">
			<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
		</div>
	)
}

export default LoadingSpinner
