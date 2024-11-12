import { Router } from "express";
import { pool } from "../utils/db.mjs";
import { validateCreatePostData } from "../middlewares/post.validation.mjs";
const postsRouter = Router();

// Create post
postsRouter.post("/", [validateCreatePostData], async (req, res) => {
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
postsRouter.get("/", async (req, res) => {
  try {
    const category = req.query.category || "";
    const keywords = req.query.keywords || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const offset = (safePage - 1) * safeLimit;

    let query = `
      select posts.id, posts.image, categories.name AS category, posts.title, posts.description, posts.date, posts.content, statuses.status, posts.likes_count
      from posts
      inner join categories on posts.category_id = categories.id
      inner join statuses on posts.status_id = statuses.id
      `;
    let countQuery = `select count(*) from posts 
    INNER JOIN categories ON posts.category_id = categories.id
    INNER JOIN statuses ON posts.status_id = statuses.id
    `;
    let values = [];
    let countValues = [];

    if (category && keywords) {
      query +=
        " where categories.name ilike $1 and (posts.title ilike $2 or posts.description ilike $2 or posts.content ilike $2)";
      countQuery +=
        " where categories.name ilike $1 and (posts.title ilike $2 or posts.description ilike $2 or posts.content ilike $2)";
      values = [`%${category}%`, `%${keywords}%`];
      countValues = [`%${category}%`, `%${keywords}%`];
    } else if (category) {
      query += " where categories.name ilike $1";
      countQuery += " where categories.name ilike $1";
      values = [`%${category}%`];
      countValues = [`%${category}%`];
    } else if (keywords) {
      query += " where posts.title ilike $1 or posts.description ilike $1 or posts.content ilike $1";
      countQuery += " where title ilike $1";
      values = [`%${keywords}%`];
      countValues = [`%${keywords}%`];
    } 

    query += ` ORDER BY posts.date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(safeLimit, offset);

    const countResult = await pool.query(countQuery, countValues);
    const totalPosts = parseInt(countResult.rows[0].count);
    const totalPage = Math.ceil(totalPosts / safeLimit);
    const result = await pool.query(query, values);

    return res.status(200).json({
      totalPosts,
      totalPage,
      currentPage: safePage,
      limit: safeLimit,
      posts: result.rows,
      nextPage: safePage < totalPage ? safePage + 1 : null,
    });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
});
// Read specific post
postsRouter.get("/:postId", async (req, res) => {
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
postsRouter.put("/:postId", [validateCreatePostData], async (req, res) => {
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
postsRouter.delete("/:postId", async (req, res) => {
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

export default postsRouter;
