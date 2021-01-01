const express = require("express");
const cors = require("cors");
const {v4: uuid} = require("uuid")

// const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

app.get("/repositories", (request, response) => {
  return response.json(repositories)
});

app.post("/repositories", (request, response) => {
  const {title, url, techs} = request.body;

  const repository = {id: uuid(), likes: 0, title, url, techs}
  repositories.push(repository)

  return response.json(repository)
});

app.put("/repositories/:id", (request, response) => {
  const {id} = request.params;
  const {title, url, techs} = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id == id)

    if (repositoryIndex < 0) { // se o id não existir ele vai retornar id =< 0
        return response.status(400).json({error: 'Project not found.'})
    }
  const {likes} = repositories[repositoryIndex]
  const repository = {id, likes, title, url, techs}

  repositories[repositoryIndex] = repository

  return response.json(repository)
});

app.delete("/repositories/:id", (request, response) => {
  const {id} = request.params

  const repositoryIndex = repositories.findIndex(repository => repository.id == id)

  if (repositoryIndex < 0) {
    return response.status(400).json({error: 'Project not found'})
  }

  repositories.splice(repositoryIndex, 1)

  return response.status(204).send()
});

app.post("/repositories/:id/like", (request, response) => {
  const {id} = request.params;
  const repositoryIndex = repositories.findIndex(repository => repository.id == id)

    if (repositoryIndex < 0) { // se o id não existir ele vai retornar id =< 0
        return response.status(400).json({error: 'Project not found.'})
    }
  
  const {likes, title, url, techs} = repositories[repositoryIndex]
  let contLikes = likes + 1
  const repository = {id, likes: contLikes, title, url, techs}
  repositories[repositoryIndex] = repository

  return response.json(repository)
});

module.exports = app