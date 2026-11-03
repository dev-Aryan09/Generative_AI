import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import rl from "readline/promises";
import { tool, createAgent } from "langchain";
import z from "zod";

dotenv.config();

const readline = rl.createInterface({
  input: process.stdin,
  output: process.stout,
});

const events = [];

// ---------- creating a tool ----------
const createEventTool = tool(
  // 1. the function
  async function ({ date, title, description }) {
    /**
     * Create event API
     */
    console.log("Event:", {
      date,
      title,
      description,
    });
    events.push({
      date,
      title,
      description,
    });

    return "Event Created"; // this message goes back to LLM
  },
  /**
   * 2. config object
   * -> This is for the Model's understanding
   */
  {
    name: "createEvent",
    description: "Created/Add a new event with date, title and description",
    // schema: What inputs to provide, and their types
    schema: z.object({
      date: z.string(),
      title: z.string(),
      description: z.string(),
    }),
  },
);

const getEventsTool = tool(
  async ({}) => {
    return events;
  },
  {
    name: "getEvents",
    description: "Retrieve all events",
    schema: z.object({}),
  },
);

const llmModel = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * -> The agent can only use tools that are in this array
 * -> The model chooses based on each tool’s description,
 *    which is why writing good descriptions is so important.
 */
const agent = createAgent({
  model: llmModel,
  tools: [createEventTool, getEventsTool],
});


while (true) {
  const userInput = await readline.question("Enter user input:");

  // if (userInput.toLowerCase() === "exit") {
  //   console.log("Exiting the current conversation")
  //   break;
  // }

  const stream = await agent.stream(
    {
      messages: [
        {
          role: "user",
          content: userInput,
        },
      ],
    },
    { streamMode: "messages" },
  );

  for await (const [chunk] of stream) {
    process.stdout.write(chunk.content);
  }

  process.stdout.write("\n");
}
/**
 * role: "user" -> tells that the message input is from the "end user" (actual question OR request)
 *
 * role: "assistant" -> tells that the message output is from the "Model"
 *
 * role: "system" -> we the developers
 */
