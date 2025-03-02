import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import supabase from "./supabaseClient.js";

const app = express();

app.use(cors());
app.use(fileUpload());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const BUCKET_NAME = "srs-bucket";

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
  const { question, difficulty, answer, userId, genre, questionType, choices,created,nextTest } =
    req.body;

  const { data, error } = await supabase
    .from("questions")
    .insert(
      {
        question,
        difficulty,
        answer,
        created,
        nextTest,
        userId,
        genre,
        questionType,
        choices,
      },
      { returning: "representation" } // Ensures we get the inserted row
    )
    .select("id"); // Retrieve the ID of the inserted row

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Created Successfully", id: data[0].id });
});

// Delete a question
app.delete("/questions/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("questions").delete().eq("id", id);

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
app.put("/lists/:listId", async (req, res) => {
  const { listId } = req.params;
  const { newListName, userId, questions } = req.body;

  const { error } = await supabase
    .from("lists")
    .update({ listName: newListName, questions })
    .eq("id", listId)
    .eq("userId", userId);

  if (error) return res.status(400).json({ error: error.message });

  res.json("Edition happened successfully");
});

app.put("/upload/:questionId", async (req, res) => {
  const { questionId } = req.params;
  const file = req.files?.image;

  if (!file) return res.status(400).json({ error: "No image uploaded" });

  const filePath = `questions/${questionId}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file.data, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) return res.status(400).json({ error: error.message });

  const { error: updateError } = await supabase
    .from("questions")
    .update({ img: true })
    .eq("id", questionId);

  if (updateError) return res.status(400).json({ error: updateError.message });

  res.json({ message: "Uploaded Successfully" });
});

// Get question image URL
app.get("/questionsImg/:questionId", async (req, res) => {
  const { questionId } = req.params;
  const filePath = `questions/${questionId}.jpg`;

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  if (!data.publicUrl)
    return res.status(404).json({ error: "Image not found" });

  res.json({ url: data.publicUrl });
});

app.listen(3001, () => console.log("Server running on port 3001"));
