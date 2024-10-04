import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
	apiKey: process.env["OPENAI_API_KEY"],
});

export async function POST(req: Request) {
	const { topic } = await req.json();
	console.log("topic: ", topic);
	try {
		const data = await client.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `# Goal
For a given topic return a roadmap that can be used to learn about the topic.

# Response structure:
- JSON format
- Include two fields: "roadmap" (list) and "information" (string)
- Do not add json markdown

# Guidelines:
- The subtopics list should go from advanced to beginner 
- The subtopics should build upon the previous subtopics

# Example:

## Example 1:
- Input: "Fractions"
Response: 
{
  "roadmap": ["Math Operations", "Numbers"],
  "information": "Fractions are a way to represent parts of a whole."
	}`,
				},
				{ role: "user", content: topic },
			],
		});

		console.log("data: ", data);
		const content = data.choices[0].message.content;
		const gptResponse = content ? JSON.parse(content) : "";
		return NextResponse.json(gptResponse);
	} catch (error) {
		console.error("Error fetching subtopics: ", error);
		return NextResponse.json({ message: "Failed to fetch subtopics" }, { status: 500 });
	}
}
