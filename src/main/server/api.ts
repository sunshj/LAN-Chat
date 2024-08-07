import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { createId } from '@paralleldrive/cuid2'
import { getResPath, randomId } from '../utils'
import { userStore } from '../store'
import { createUserDto, updateUserDto } from './dto'

const router = Router()

const upload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      cb(null, path.join(getResPath(), 'uploads'))
    },
    filename(_req, file, cb) {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
      cb(null, `${randomId()}-${file.originalname}`)
    }
  })
})

router.get('/', (_req, res) => {
  res.status(404).send()
})

router.get('/users', (_req, res) => {
  res.send({
    data: userStore.findMany()
  })
})

router.get('/user/:id', (req, res) => {
  res.send({
    data: userStore.findOne(req.params.id)
  })
})

router.put('/user/:id', updateUserDto, (req, res) => {
  const user = userStore.findOne(req.params.id)
  if (!user) {
    res.status(404).send('user not found')
    return
  }
  res.send({
    data: userStore.mutation(req.params.id, { username: req.body.username })
  })
})

router.post('/user', createUserDto, (req, res) => {
  const id = createId()
  res.send({
    data: userStore.mutation(id, { username: req.body.username })
  })
})

router.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file!
  res.send({
    data: file
  })
})

router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename
  res.download(path.join(getResPath(), 'uploads', filename))
})

export default router
