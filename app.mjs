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
// Create post
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
// Read all of posts limit 6
app.get("/posts", async (req, res) => {
  try {
    const category = req.query.category;
    const keywords = req.query.keywords;
    const page = parseInt(req.query.page) || 1;
    const PAGE_SIZE = 6;
    const offset = (page - 1) * PAGE_SIZE;

    let query = "select * from posts";
    let countQuery = "select count(*) from posts";
    let values = [];
    let countValues = [];

    if (category && keywords) {
      query += " where category ilike $1 and title ilike $2 limit $3 offset $4";
      countQuery += " where category ilike $1 and title ilike $2 ";
      values = [`%${category}%`, `%${keywords}%`, PAGE_SIZE, offset];
      countValues = [`%${category}%`, `%${keywords}%`];
    } else if (category) {
      query += " where category ilike $1 limit $2 offset $3";
      countQuery += " where category ilike $1";
      values = [`%${category}%`, PAGE_SIZE, offset];
      countValues = [`%${category}%`];
    } else if (keywords) {
      query += " where title ilike $1 limit $2 offset $3";
      countQuery += " where title ilike $1";
      values = [`%${keywords}%`, PAGE_SIZE, offset];
      countValues = [`%${keywords}%`];
    } else {
      query += " limit $1 offset $2";
      values = [PAGE_SIZE, offset];
    }

    const countResult = await pool.query(countQuery, countValues);
    const totalPosts = parseInt(countResult.rows[0].count);
    const totalPage = Math.ceil(totalPosts / PAGE_SIZE);
    const result = await pool.query(query, values);

    return res.status(200).json({
      totalPosts,
      totalPage,
      currentPage: page,
      limit: PAGE_SIZE,
      posts: result.rows,
      nextPage: page < totalPage ? page + 1 : null,
    });
  } catch (e) {
    res.status(500).json({
      message: `Server could not read post because database connection`,
    });
  }
});
// Read specific post
app.get("/posts/:postId", async (req, res) => {
  const postId = req.params.postId;
  try {
    const result = await pool.query(`select * from posts where id=$1`, [
      postId,
    ]);
    return res.status(201).json({
      data: result.rows[0],
    });
  } catch (e) {
    res.status(500).json({
      message: `Server could not read post because database connection`,
    });
    res.status(404).json({
      message: `Server could not find a requested post`,
    });
  }
});
// Update post
app.put("/posts/:postId", async (req, res) => {
  const postId = req.params.postId;
  const updatedPost = { ...req.body };
  try {
    const result = await pool.query(
      `update posts set title = $2, image = $3, category_id = $4, description = $5, content = $6, status_id = $7 where id = $1`,
      [
        postId,
        updatedPost.title,
        updatedPost.image,
        updatedPost.category_id,
        updatedPost.description,
        updatedPost.content,
        updatedPost.status_id,
      ]
    );
    return res.status(200).json({
      message: `Updated post sucessfully`,
    });
  } catch (e) {
    console.error("Error updating post:", e.message);
    res.status(404).json({
      message: `Server could not find a requested post to update`,
    });
    res.status(500).json({
      message: `Server could not delete post because database connection`,
    });
  }
});
// Delete
app.delete("/posts/:postId", async (req, res) => {
  const postId = req.params.postId;
  try {
    await pool.query(`delete from posts where id = $1`, [postId]);
    res.status(200).json({
      message: `Deleted post sucessfully`,
    });
  } catch (e) {
    console.error("Error deleting post:", e.message);
    res.status(404).json({
      message: `Server could not find a requested post to delete`,
    });
    res.status(500).json({
      message: `Server could not delete post because database connection`,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
