import { tmpdir } from 'node:os'
import path from 'node:path'
import { defaultStore, startServer, stopServer } from 'lan-chat-server'
import {
  computed,
  defineExtension,
  extensionContext,
  onActivate,
  onDeactivate,
  ref,
  useCommand,
  useStatusBarItem,
  useWorkspaceFolders
} from 'reactive-vscode'
import {
  env,
  StatusBarAlignment,
  Uri,
  ViewColumn,
  commands as vscodeCommands,
  window
} from 'vscode'
import { config } from './config'
import { commands } from './generated/meta'
import { createStoreHandlers } from './store'
import { ensureDir, ensureFile, getWebviewContents, logger } from './utils'

const { activate, deactivate } = defineExtension(() => {
  logger.info('Extension Activated: <lan-chat>')
  const workspaceFolder = useWorkspaceFolders()

  const cwd = computed(() =>
    config.enableTempPath ? tmpdir() : workspaceFolder.value?.[0]?.uri.fsPath
  )

  const isRunning = ref(false)

  const statusBarItem = useStatusBarItem({
    id: 'lan-chat',
    text: () => `$(comment-discussion) LAN Chat ${isRunning.value ? 'Running' : 'Stopped'}`,
    alignment: StatusBarAlignment.Left,
    priority: -1,
    color: () => (isRunning.value ? 'white' : 'black'),
    tooltip: 'LAN Chat Server',
    command: () => (isRunning.value ? commands.stop : commands.start)
  })

  onActivate(() => {
    statusBarItem.show()

    if (config.autoStart) {
      vscodeCommands.executeCommand(commands.start)
    }
  })

  onDeactivate(() => {
    if (isRunning.value && config.autoStop) {
      vscodeCommands.executeCommand(commands.stop)
    }
  })

  useCommand(commands.start, async () => {
    logger.info('LAN Chat Server: <start>')

    const storePath = ensureFile(
      path.join(cwd.value ?? '', config.storePath),
      JSON.stringify(defaultStore)
    )

    const uploadsDir = ensureDir(path.join(cwd.value ?? '', config.uploadsDir))
    const uiDir = Uri.joinPath(extensionContext.value!.extensionUri!, 'res/ui').fsPath

    logger.info('Store path', JSON.stringify(storePath))
    logger.info('Uploads path', JSON.stringify(uploadsDir))

    isRunning.value = await startServer({
      host: config.host,
      port: config.port,
      uiDir,
      uploadsDir,
      storeHandlers: createStoreHandlers(storePath)
    })

    const webUri = Uri.parse(`http://${config.host}:${config.port}`, true)

    window
      .showInformationMessage(
        `LAN Chat Server Started on ${webUri}`,
        'Open in VS Code',
        'Open in Browser'
      )
      .then(item => {
        if (item === 'Open in VS Code') {
          const panel = window.createWebviewPanel('lan-chat', 'LAN Chat', ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [Uri.file(uiDir), Uri.file(uploadsDir)]
          })

          panel.webview.html = getWebviewContents(webUri.toString())
        } else if (item === 'Open in Browser') {
          env.openExternal(webUri)
        }
      })
  })

  useCommand(commands.stop, () => {
    logger.info('LAN Chat Server: <stop>')
    isRunning.value = stopServer()

    window.showInformationMessage('LAN Chat Server Stopped')
  })
})

export { activate, deactivate }
