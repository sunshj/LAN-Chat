import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { createId } from '@paralleldrive/cuid2'
import { getAudioFileInfo, getImageThumbnail, getMessageType, getResPath, randomId } from '../utils'
import { users } from '../store'
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

router.get('/', (req, res) => {
  const timestamp = Number.parseInt(req.query.t as string)
  res.send({
    message: new Date(timestamp).toLocaleString()
  })
})

router.get('/users', (_req, res) => {
  res.send({
    data: users.findMany()
  })
})

router.get('/user/:id', (req, res) => {
  res.send({
    data: users.findOne(req.params.id)
  })
})

router.put('/user/:id', updateUserDto, (req, res) => {
  const user = users.findOne(req.params.id)
  if (!user) {
    res.status(404).send('user not found')
    return
  }
  res.send({
    data: users.mutation(req.params.id, { username: req.body.username })
  })
})

router.post('/user', createUserDto, (req, res) => {
  const id = createId()
  res.send({
    data: users.mutation(id, { username: req.body.username })
  })
})

router.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file!
  const type = getMessageType(file.mimetype)
  const payload: any = {
    audio: undefined,
    video: undefined,
    image: undefined
  }

  if (type === 'audio') payload.audio = await getAudioFileInfo(file)
  if (type === 'image') payload.image = await getImageThumbnail(file)

  res.send({
    data: { ...file, payload }
  })
})

router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename
  res.download(path.join(getResPath(), 'uploads', filename))
})

export default router
