import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { topicChain } = await req.json();
	console.log("topicChain: ", topicChain);
	try {
		const response = await fetch(process.env.AZURE_OPENAI_ENDPOINT!, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"api-key": process.env.AZURE_OPENAI_API_KEY!,
			},
			body: JSON.stringify({
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
				max_tokens: 1500,
				temperature: 0
			}),
		});

		const data = await response.json();
		console.log("data: ", data);
		const gptResponse = JSON.parse(data.choices[0].message.content);
		return NextResponse.json(gptResponse);
	} catch (error) {
		console.error("Error fetching subtopics: ", error);
		return NextResponse.json({ message: "Failed to fetch subtopics" }, { status: 500 });
	}
}
