import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { eq } from 'drizzle-orm'
import { getAudioFileInfo, getImageThumbnail, getMessageType, getResPath, randomId } from '../utils'
import { db, users } from '../database'
import { createUserDto, updateUserDto } from './dto'

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
  const data = await db.select().from(users)
  res.send({
    data
  })
})

router.get('/user/:id', async (req, res) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.params.id))
  res.send({
    data: user
  })
})

router.put('/user/:id', updateUserDto, async (req, res) => {
  const [user] = await db
    .update(users)
    .set({ username: req.body.username })
    .where(eq(users.id, req.params.id))
    .returning()

  res.send({
    data: user
  })
})

router.post('/user', createUserDto, async (req, res) => {
  const [user] = await db.insert(users).values({ username: req.body.username }).returning()

  res.send({
    data: user
  })
})

router.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file
  const type = getMessageType(file?.mimetype)
  const payload = {
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
