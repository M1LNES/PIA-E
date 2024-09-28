// pages/skibidi.tsx
import Layout from './Layout'

// Define the type for the items
interface Item {
	title: string
	text: string
}

export default function Skibidi() {
	// Sample array with 5 items
	const items: Item[] = [
		{ title: 'Title 1', text: 'This is the first text.' },
		{ title: 'Title 2', text: 'This is the second text.' },
		{ title: 'Title 3', text: 'This is the third text.' },
		{ title: 'Title 4', text: 'This is the fourth text.' },
		{ title: 'Title 5', text: 'This is the fifth text.' },
	]

	return (
		<Layout>
			{/* Map through the items and render each in a "frame" */}
			{items.map((item, index) => (
				<div
					key={index}
					className='p-4 mb-4 bg-white shadow-lg rounded-md border border-gray-200'
				>
					<h2 className='text-xl font-semibold mb-2'>{item.title}</h2>
					<p>{item.text}</p>
				</div>
			))}
		</Layout>
	)
}
