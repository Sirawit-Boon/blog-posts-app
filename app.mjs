import express from "express";
import cors from "cors";
import postsRouter from "./routes/posts.mjs";
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/posts", postsRouter);

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

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
