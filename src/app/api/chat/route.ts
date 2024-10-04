import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { messages } = await req.json();
	try {
		const systemPrompt = `# Goal
To respond to a user's messages with relevant information.

# Guidelines:
- Be concise and informative.
- Return markdown formatted text.
- Enclose mathematical formulas in dollar signs.
`
		const response = await fetch(process.env.AZURE_OPENAI_ENDPOINT!, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"api-key": process.env.AZURE_OPENAI_API_KEY!,
			},
			body: JSON.stringify({
				messages: [{role: "system", content: systemPrompt}, ...messages],
				max_tokens: 2000,
				temperature: 0,
			}),
		});

		const data = await response.json();
		return NextResponse.json(data.choices[0].message.content);
	} catch (error) {
		console.error("Error fetching subtopics: ", error);
		return NextResponse.json({ message: "Failed to fetch subtopics" }, { status: 500 });
	}
}
