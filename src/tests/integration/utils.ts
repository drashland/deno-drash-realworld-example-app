import BaseModel from "../../models/base_model.ts";

export async function clearTestArticles() {
  const query = "DELETE FROM articles";
  await BaseModel.query(query);
}

export async function clearTestComments() {
  const query = "DELETE FROM article_comments";
  await BaseModel.query(query);
}

export async function clearTestSessions() {
  const query = "DELETE FROM sessions";
  await BaseModel.query(query);
}
