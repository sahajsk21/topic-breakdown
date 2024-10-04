import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { topic } = await req.json();
	console.log("topic: ", topic);
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
				max_tokens: 1000,
				temperature: 0,
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
