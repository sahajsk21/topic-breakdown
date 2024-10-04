import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
	apiKey: process.env["OPENAI_API_KEY"],
});

export async function POST(req: Request) {
	const { messages } = await req.json();
	const systemPrompt = `# Goal
To respond to a user's messages with relevant information.

# Guidelines:
- Be concise and informative.
- Return markdown formatted text.
- Enclose mathematical formulas in dollar signs.
`;
	try {
		const data = await client.chat.completions.create({
			model: "gpt-4o",
			messages: [{ role: "system", content: systemPrompt }, ...messages],
		});

		console.log("data: ", data);
		return NextResponse.json(data.choices[0].message.content);
	} catch (error) {
		console.error("Error fetching subtopics: ", error);
		return NextResponse.json({ message: "Failed to fetch subtopics" }, { status: 500 });
	}
}
