import express from "express";
import cors from "cors";
import { pool } from "./utils/db.mjs";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/profiles", (req, res) => {
  return res.json({
    data: {
      name: "john",
      age: 20,
    },
  });
});

app.get("/", (req, res) => {
  return res.send(`Hello express`);
});

app.post("/posts", async (req, res) => {
  const newPost = { ...req.body, date: new Date() };
  try {
    await pool.query(
      `insert into posts (image,category_id,title,description,date,content,status_id,likes_count)
      values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        newPost.image,
        newPost.category_id,
        newPost.title,
        newPost.description,
        newPost.date,
        newPost.content,
        newPost.status_id,
        newPost.likes_count,
      ]
    );
    return res.status(201).json({
      message: `Created post sucessfully`,
    });
  } catch (e) {
    return res.status(500).json({
      message: `Server could not create post because database connection`,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
