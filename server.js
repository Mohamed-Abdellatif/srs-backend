import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import supabase from "./supabaseClient.js";

const app = express();

app.use(cors());
app.use(fileUpload());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Get a question by ID
app.get("/question/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// Update a question
app.put("/questions/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const { error } = await supabase
    .from("questions")
    .update(updateData)
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  res.json("Edition happened successfully");
});

// Get multiple questions by IDs
app.post("/getQuestionsById", async (req, res) => {
  const { questionsList } = req.body;

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .in("id", questionsList);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// Get questions by userId with limit
app.post("/getQuestions", async (req, res) => {
  const { questionsNumber, userId } = req.body;

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("userId", userId)
    .limit(questionsNumber);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// Search questions by content
app.post("/searchQuestions/:question", async (req, res) => {
  const { question } = req.params;
  const { userId } = req.body;

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("userId", userId)
    .ilike("question", `%${question}%`);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// Get number of questions for a user
app.post("/questionsLength", async (req, res) => {
  const { userId } = req.body;

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("userId", userId);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data.length);
});

// Get next test dates for user
app.post("/questionsNextTest", async (req, res) => {
  const { userId } = req.body;

  const { data, error } = await supabase
    .from("questions")
    .select("nextTest")
    .eq("userId", userId);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// Create a question
app.post("/questions", async (req, res) => {
  const { question, difficulty, answer, userId, genre, questionType, choices } = req.body;

  const { error } = await supabase
    .from("questions")
    .insert([{ question, difficulty, answer, userId, genre, questionType, choices }]);

  if (error) return res.status(400).json({ error: error.message });

  res.json("Created Successfully");
});

// Delete a question
app.delete("/questions/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  res.json("Deleted Successfully");
});

// Create a list
app.post("/lists", async (req, res) => {
  const { listName, userId, questions } = req.body;

  const { error } = await supabase
    .from("lists")
    .insert([{ listName, userId, questions }]);

  if (error) return res.status(400).json({ error: error.message });

  res.json("Created Successfully");
});

// Get questions from a list
app.post("/getListQuestions", async (req, res) => {
  const { listName, userId } = req.body;

  const { data, error } = await supabase
    .from("lists")
    .select("questions")
    .eq("listName", listName)
    .eq("userId", userId);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// Get all lists for a user
app.post("/getLists", async (req, res) => {
  const { userId } = req.body;

  const { data, error } = await supabase
    .from("lists")
    .select("*")
    .eq("userId", userId);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// Update a list
app.put("/lists/:listName", async (req, res) => {
  const { listName } = req.params;
  const { newListName, userId, questions } = req.body;

  const { error } = await supabase
    .from("lists")
    .update({ listName: newListName, questions })
    .eq("listName", listName)
    .eq("userId", userId);

  if (error) return res.status(400).json({ error: error.message });

  res.json("Edition happened successfully");
});

// Upload an image
app.put("/upload/:questionId", async (req, res) => {
  const { questionId } = req.params;
  const { data } = req.files.image;

  const { error } = await supabase
    .from("questions")
    .update({ img: data })
    .eq("id", questionId);

  if (error) return res.status(400).json({ error: error.message });

  res.json("Uploaded Successfully");
});

// Get question image
app.get("/questionsImg/:questionId", async (req, res) => {
  const { questionId } = req.params;

  const { data, error } = await supabase
    .from("questions")
    .select("img")
    .eq("id", questionId)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  if (!data.img) return res.status(404).json({ error: "Image not found" });

  res.writeHead(200, { "Content-Type": "image/jpeg" });
  res.end(data.img);
});

app.listen(3001, () => console.log("Server running on port 3001"));
