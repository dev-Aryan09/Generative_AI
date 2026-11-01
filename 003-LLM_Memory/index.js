import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import rl from "readline/promises";

dotenv.config();

const readline = rl.createInterface({
  input: process.stdin,
  output: process.stout,
});

// readline.close();

const llmModel = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API_KEY,
});

// conversation is stored here (Memory)
const messages = [];

while (true) {
  const userInput = await readline.question("Enter user input:");

  messages.push({
    role: "user",
    content: userInput,
  });

  const stream = await llmModel.stream(messages);

  let aiMessage = "";

  for await (const chunk of stream) {
    aiMessage += chunk.content; //gathering all the chunks into a full message
    messages.push({
      role: "assistant",
      content: aiMessage,
    });
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
