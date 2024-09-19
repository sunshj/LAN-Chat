# LAN-Chat <sup>vscode</sup>

## Configurations

<!-- configs -->

| Key                      | Description                                                   | Type      | Default                  |
| ------------------------ | ------------------------------------------------------------- | --------- | ------------------------ |
| `LANChat.port`           | port of the server                                            | `number`  | `3000`                   |
| `LANChat.host`           | host of the server                                            | `string`  | `"127.0.0.1"`            |
| `LANChat.autoStart`      | auto start the server when vscode start                       | `boolean` | `true`                   |
| `LANChat.autoStop`       | auto stop the server when vscode exit                         | `boolean` | `true`                   |
| `LANChat.enableTempPath` | enable temp path, if false, use the path in current workspace | `boolean` | `true`                   |
| `LANChat.storePath`      | the folder to store server json data                          | `string`  | `".lan-chat/store.json"` |
| `LANChat.uploadsPath`    | the folder to store uploaded files                            | `string`  | `".lan-chat/uploads"`    |

<!-- configs -->

## Commands

<!-- commands -->

| Command         | Title                  |
| --------------- | ---------------------- |
| `LANChat.start` | LAN Chat: start server |
| `LANChat.stop`  | LAN Chat: stop server  |

<!-- commands -->
