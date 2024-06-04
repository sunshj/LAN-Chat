import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { getResPath, prisma, randomId } from '../utils'

const router = Router()
const upload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      cb(null, path.join(getResPath(), 'uploads'))
    },
    filename(_req, file, cb) {
      const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
      cb(null, `${randomId()}-${originalname}`)
    }
  })
})

router.get('/', (req, res) => {
  const timestamp = Number.parseInt(req.query.t as string)
  res.send({
    message: new Date(timestamp).toLocaleString()
  })
})

router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany()
  res.send({
    data: users
  })
})

router.get('/user/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.params.id
    }
  })
  res.send({
    data: user
  })
})

router.put('/user/:id', async (req, res) => {
  const user = await prisma.user.update({
    where: {
      id: req.params.id
    },
    data: {
      username: req.body.username
    }
  })
  res.send({
    data: user
  })
})

router.post('/user', async (req, res) => {
  const user = await prisma.user.create({
    data: {
      username: req.body.username
    }
  })
  res.send({
    data: user
  })
})

router.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file
  res.send({
    data: file
  })
})

router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename
  res.download(path.join(getResPath(), 'uploads', filename))
})

export default router
