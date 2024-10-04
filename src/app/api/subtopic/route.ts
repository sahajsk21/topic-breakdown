import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
	apiKey: process.env["OPENAI_API_KEY"],
});

export async function POST(req: Request) {
	const { topicChain } = await req.json();
	console.log("topicChain: ", topicChain);
	try {
		const data = await client.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `# Goal
Return a list of subtopics and additional information for a given topic chain.

# Response structure:
- JSON format
- Include two fields: "subtopics" (list) and "information" (string)
- Do not add json markdown

# Guidelines:
- User is trying to learn about a topic by breaking it down into fundamental subtopics.
- Subtopics should be building blocks of the main topic.
- Try breaking the topic until we reach a topic that is simple enough to be understood by a beginner.
- Be conservative in listing subtopics and make them as mutually exclusive as possible.
- List the in order of learning roadmap.
- Add detailed information in the "information" field.

# Examples:

## Example 1:
User Input: Math -> Algebra
Response: 
{
  "subtopics": ["Linear Algebra", "Abstract Algebra"],
  "information": "Algebra is a branch of mathematics that deals with symbols and the rules for manipulating those symbols."
}`,
				},
				{ role: "user", content: topicChain },
			],
		});

		console.log("data: ", data);
		const content = data.choices[0].message.content;
		if (content) {
			const gptResponse = JSON.parse(content);
			return NextResponse.json(gptResponse);
		} else {
			return NextResponse.json({ status: 500 });
		}
	} catch (error) {
		console.error("Error fetching subtopics: ", error);
		return NextResponse.json({ message: "Failed to fetch subtopics" }, { status: 500 });
	}
}
