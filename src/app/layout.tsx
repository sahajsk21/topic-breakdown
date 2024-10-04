import '../styles/globals.css';

export const metadata = {
	title: "Topic Breakdown",
	description: "Breakdown a topic into subtopics for fundamental understanding.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
