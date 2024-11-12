export const validateCreatePostData = (req, res, next) => {
  if (!req.body.title) {
    return res.status(400).json({
      message: "Title is required",
    });
  } else if (typeof req.body.title !== "string") {
    return res.status(400).json({
      message: "Title must be a string",
    });
  }
  if (!req.body.image) {
    return res.status(400).json({
      message: "image is required",
    });
  } else if (typeof req.body.image !== "string") {
    return res.status(400).json({
      message: "image must be a string",
    });
  }
  if (!req.body.category_id) {
    return res.status(400).json({
      message: "Category ID is required",
    });
  } else if (typeof req.body.category_id !== "number") {
    return res.status(400).json({
      message: "Category ID must be a number",
    });
  }
  if (!req.body.description) {
    return res.status(400).json({
      message: "description is required",
    });
  } else if (typeof req.body.description !== "string") {
    return res.status(400).json({
      message: "description must be a string",
    });
  }
  if (!req.body.content) {
    return res.status(400).json({
      message: "content is required",
    });
  } else if (typeof req.body.content !== "string") {
    return res.status(400).json({
      message: "content must be a string",
    });
  }
  if (!req.body.status_id) {
    return res.status(400).json({
      message: "Status ID is required",
    });
  } else if (typeof req.body.status_id !== "number") {
    return res.status(400).json({
      message: "Status ID must be a number",
    });
  }
  next();
};
