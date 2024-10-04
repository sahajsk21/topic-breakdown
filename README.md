# Topic Breakdown

Topic Breakdown is a web application that helps users break down complex topics into fundamental subtopics for better understanding. The application uses LLMs to generate subtopics and additional information based on user input.

## Getting Started

First, clone the repository and navigate to the project directory:

```bash
git clone https://github.com/sahajsk21/topic-breakdown.git
cd topic-breakdown
```

Next, install the required dependencies:

```bash
npm install
```

Create a .env.local file in the root directory and add your environment variables:
    
```bash
AZURE_OPENAI_ENDPOINT=<your-azure-openai-endpoint>
AZURE_OPENAI_API_KEY=<your-azure-openai-api-key>
```

Finally, start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
