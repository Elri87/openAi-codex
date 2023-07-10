import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

//to test
//console.log(process.env.OPENAI_API_KEY);

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
//Middleware
app.use(cors()); //allow server to be called from frontend
app.use(express.json()); //pass json from the front to the back

//dummy root
app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from Codex",
  });
});

//allows payload or get data from frontend body
app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    //get a response from openapi
    const response = await openai.createCompletion({
      //function that takes in an object
      model: "text-davinci-003",
      //prompt: req.body.prompt,
      prompt: `${prompt}`,
      temperature: 0, //higher temp means the model will take more risks, so answer with what it knows
      max_tokens: 3000, //long responses
      top_p: 1,
      frequency_penalty: 0.5, //will not repeat similar sentences often
      presence_penalty: 0,
    });
    res.status(200).send({
      bot: response.data.choices[0].text,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

app.listen(5000, () =>
  console.log("Server is running on port http://localhost:5000")
);
