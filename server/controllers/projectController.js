const mongoose = require('mongoose')
const Project = require('../models/Project')
const { RequestError, requiredText, positiveNumber, validDate } = require('../utils/validation')

function publicEntry(entry, projectId) {
  return {
    id: entry._id.toString(),
    projectId: projectId.toString(),
    type: entry.type,
    date: entry.date,
    item: entry.item,
    category: entry.category,
    quantity: entry.quantity,
    unit: entry.unit,
    rate: entry.rate,
    total: entry.total,
  }
}

function publicProject(project) {
  return {
    id: project._id.toString(),
    name: project.name,
    location: project.location,
    address: project.address,
    unit: project.unit,
    size: project.size,
    status: project.status,
    entries: project.entries.map((entry) => publicEntry(entry, project._id)),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

async function listProjects(req, res) {
  const projects = await Project.find({ owner: req.userId }).sort({ createdAt: -1 })
  return res.json({ projects: projects.map(publicProject) })
}

async function createProject(req, res) {
  const project = await Project.create({
    owner: req.userId,
    name: requiredText(req.body.name, 'Project name'),
    location: requiredText(req.body.location, 'Location'),
    address: requiredText(req.body.address, 'Street / address', 200),
    unit: requiredText(req.body.unit, 'Measurement unit', 30),
    size: positiveNumber(req.body.size, 'Size'),
    status: 'Draft',
  })
  return res.status(201).json({ project: publicProject(project) })
}

async function updateProject(req, res) {
  const project = await findOwnedProject(req)
  project.name = requiredText(req.body.name, 'Project name')
  project.location = requiredText(req.body.location, 'Location')
  project.address = requiredText(req.body.address, 'Street / address', 200)
  project.unit = requiredText(req.body.unit, 'Measurement unit', 30)
  project.size = positiveNumber(req.body.size, 'Size')
  await project.save()
  return res.json({ project: publicProject(project) })
}

async function deleteProject(req, res) {
  const project = await findOwnedProject(req)
  await project.deleteOne()
  return res.json({ message: 'Project deleted.' })
}

async function findOwnedProject(req) {
  if (!mongoose.isValidObjectId(req.params.projectId)) {
    throw new RequestError('Project not found.', 404)
  }
  const project = await Project.findOne({ _id: req.params.projectId, owner: req.userId })
  if (!project) throw new RequestError('Project not found.', 404)
  return project
}

async function listEntries(req, res) {
  const project = await findOwnedProject(req)
  const { type } = req.query
  if (type && !['labour', 'material'].includes(type)) {
    throw new RequestError('Entry type must be labour or material.')
  }
  const entries = project.entries.filter((entry) => !type || entry.type === type)
  return res.json({ entries: entries.map((entry) => publicEntry(entry, project._id)) })
}

async function createEntry(req, res) {
  const project = await findOwnedProject(req)
  const { type, date } = req.body
  if (!['labour', 'material'].includes(type)) {
    throw new RequestError('Entry type must be labour or material.')
  }
  if (!validDate(date)) throw new RequestError('Enter a valid entry date.')

  const quantity = positiveNumber(req.body.quantity, 'Quantity')
  const rate = positiveNumber(req.body.rate, 'Rate', true)
  project.entries.push({
    type,
    date,
    item: requiredText(req.body.item, 'Item'),
    category: requiredText(req.body.category, 'Category', 80),
    quantity,
    unit: requiredText(req.body.unit, 'Unit', 40),
    rate,
    total: quantity * rate,
  })
  await project.save()

  const entry = project.entries[project.entries.length - 1]
  return res.status(201).json({ entry: publicEntry(entry, project._id) })
}

async function updateEntry(req, res) {
  const project = await findOwnedProject(req)
  const entry = project.entries.id(req.params.entryId)
  if (!entry) throw new RequestError('Entry not found.', 404)

  const { date } = req.body
  if (!validDate(date)) throw new RequestError('Enter a valid entry date.')

  const quantity = positiveNumber(req.body.quantity, 'Quantity')
  const rate = positiveNumber(req.body.rate, 'Rate', true)
  entry.date = date
  entry.item = requiredText(req.body.item, 'Item')
  entry.category = requiredText(req.body.category, 'Category', 80)
  entry.quantity = quantity
  entry.unit = requiredText(req.body.unit, 'Unit', 40)
  entry.rate = rate
  entry.total = quantity * rate
  await project.save()

  return res.json({ entry: publicEntry(entry, project._id) })
}

async function deleteEntry(req, res) {
  const project = await findOwnedProject(req)
  const entry = project.entries.id(req.params.entryId)
  if (!entry) throw new RequestError('Entry not found.', 404)
  entry.deleteOne()
  await project.save()
  return res.json({ message: 'Entry deleted.' })
}

module.exports = { listProjects, createProject, updateProject, deleteProject, listEntries, createEntry, updateEntry, deleteEntry }
