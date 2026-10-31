import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import { read } from "fs";
import rl from "readline/promises";

dotenv.config();

const readline = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const userInput = await readline.question("Enter user input: ");

readline.close();

const llmModel = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API_KEY,
});

const response = await llmModel.invoke(userInput);

console.log(response.content);

// Invocation - a chat model must be invoked to generate an output
/**
 * invoke() - returns the full AIMessage output
 * stream() - stream() returns multiple AIMessageChunk objects, each containing a portion of the output text.
 *            Importantly, each chunk in a stream is designed to be gathered into a full message via summation.
 * batch() -  method on a chat model that lets us process multiple independent prompts or messages in a single execution call
 */
