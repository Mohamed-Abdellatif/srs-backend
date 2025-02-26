const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const knex = require("knex");

const fileUpload = require("express-fileupload");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "123456",
    database: "srs",
  },
});

const app = express();


app.use(cors());
app.use(fileUpload());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.get("/question/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("questions")
    .where({ id })
    .then((question) => {
      if (question.length) {
        res.json(question[0]);
      } else {
        res.status(400).json("Not Found");
      }
    })
    .catch((err) => res.status(400).json("Error getting question"));
});

app.put("/questions/:id", (req, res) => {
  const { id } = req.params;
  const {
    question,
    difficulty,
    answer,
    genre,
    questionType,
    lastTested,
    nextTest,
    interval,
    stability,
  } = req.body;
  db.select("*")
    .from("questions")
    .where({ id })
    .update({
      question: question,
      difficulty: difficulty,
      answer: answer,
      genre: genre,
      questionType: questionType,
      lastTested: lastTested,
      nextTest: nextTest,
      interval: interval,
      stability: stability,
    })
    .then(res.json("Edition happened successfully"));
});

app.post("/getQuestionsById", (req, res) => {
  const { questionsList } = req.body;
  db.select("*")
    .from("questions")

    .then((questions) => {
      const qarray = [].concat(
        questionsList.map((id) =>
          questions.filter((question) => question.id === id)
        )
      );
      res.json(qarray.map((question) => question[0]));
    })
    .catch((err) => res.status(400).json("Error getting questions"));
});

app.post("/getQuestions", (req, res) => {
  const {questionsNumber, userId } = req.body;
  db.select("*")
    .from("questions")
    .where("userId", userId)
    .then((questions) => {
      if (questions.length > questionsNumber) {
        res.json(questions.slice(0, questionsNumber));
      } else {
        res.json(questions);
      }
    })
    .catch((err) => res.status(400).json("Error getting questions"));
});

app.post("/searchQuestions/:question", (req, res) => {
  const { question } = req.params;
  const { userId } = req.body;
  db.select("*")
    .from("questions")
    .where("userId", userId)
    .whereRaw(`LOWER(question) LIKE ?`, [`%${question.toLowerCase()}%`])
    .then((questions) => res.json(questions))
    .catch((err) => res.status(400).json(err));
});

app.post("/questionsLength", (req, res) => {
  const { userId } = req.body;
  db.select("*")
    .from("questions")
    .where("userId", userId)
    .then((questions) => res.json(questions.length))
    .catch((err) => res.status(400).json("Error getting questions"));
});

app.post("/questionsNextTest", (req, res) => {
  const { userId } = req.body;
  db.select("nextTest")
    .from("questions")
    .where("userId", userId)
    .then((questions) => res.json(questions))
    .catch((err) => res.status(400).json("Error getting questions"));
});

app.post("/questions", (req, res) => {
  const { question, difficulty, answer, userId, genre, questionType, choices } =
    req.body;
  
  db("questions")
    .insert({
      question: question,
      difficulty: difficulty,
      answer: answer,
      created: new Date(),
      userId: userId,
      genre: genre,
      questionType: questionType,
      choices: choices,
      
    })
    .then(() => res.json("Created Successfully"))
    .catch((err) => res.status(400).json("Unable to create the question"));
});

app.delete("/questions/:id", (req, res) => {
  const { id } = req.params;
  db("questions")
    .returning("*")
    .where({ id })
    .del()
    .then(() => res.json("Deleted Successfully"))
    .catch((err) => res.status(400).json(err));
});
app.post("/lists", (req, res) => {
  const { listName, userId, questions } = req.body;
  db("lists")
    .insert({
      listName: listName,
      userId: userId,
      questions: questions,
    })
    .then((list) => res.status(200).json("Created Successfully"))
    .catch((err) => {
      if (
        err.message ===
        'insert into "lists" ("listName", "questions", "userId") values ($1, DEFAULT, DEFAULT) - duplicate key value violates unique constraint "lists_listname_key"'
      ) {
        res.json("This list already exists");
      } else {
        res.json(err.message);
      }
    });
});

app.post("/getListQuestions", (req, res) => {
  const { listName, userId } = req.body;
  db.select("questions")
    .from("lists")
    .where("listName", listName)
    .where("userId", userId)
    .then((list) => res.json(list))
    .catch((err) => res.status(400).json("Error getting questions"));
});
app.post("/getLists", (req, res) => {
  const  userId  = '7lliXdMfL3bDjnEq70rqGKgO5cE3';
  db.select("*")
    .from("lists")
    .where("userId", userId)
    .then((lists) => res.json(lists))
    .catch((err) => res.status(400).json("Error getting lists"));
});

app.put("/lists/:listName", (req, res) => {
  const { listName } = req.params;
  const { newListName, userId, questions } = req.body;
  db.select("*")
    .from("lists")
    .where("listName", listName)
    .where("userId", userId)
    .update({
      listName: newListName,
      questions: JSON.stringify(questions),
    })
    .then(res.json("Edition happened successfully"));
});

const { Pool } = require('pg');
const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "postgres",
  password: "123456",
  database: "srs",
});



app.put('/upload/:questionId', async (req, res) => {
  const {  data } = req.files.image;
  const { questionId } = req.params;
  db("questions")
  .where("id", questionId)
  .update({
      img:data,
         
    })
    .then((image) => res.status(200).json("Uploaded Successfully"))
    .catch((err)=>  res.status(400).json(err))
});

app.get('/questionsImg/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const result = await pool.query(
      'SELECT img FROM questions WHERE id = $1',
      [questionId]
    );

    if (result.rows.length > 0) {
      const imgBuffer = result.rows[0].img; // Fix: Access 'img' instead of 'data'

      if (!imgBuffer) {
        return res.status(404).json({ error: "Image not found" });
      }

      res.writeHead(200, {
        'Content-Type': 'image/jpeg', // Adjust if the format is different
        'Content-Length': imgBuffer.length,
      });

      res.end(imgBuffer); // Send image binary data
    } else {
      res.status(404).json({ error: "No image found" });
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "Server error" });
  }
});



app.listen(3001, () => {
  console.log("running");
});
