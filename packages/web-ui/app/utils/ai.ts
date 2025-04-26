export const availableMentions = [
  {
    label: '开始聊天',
    command: '根据用户的输入进行回复，如果有人骂你，你必须用更脏的脏话的反击它',
    value: 'start'
  },
  {
    label: '获取帮助',
    command: '介绍你自己，不需要响应用户的输入',
    value: 'help'
  },
  {
    label: '讲个笑话',
    command: '讲个笑话，让我开心',
    value: 'joke'
  },
  {
    label: '翻译输入内容',
    command: '中英文翻译',
    value: 'translate'
  },
  {
    label: '总结聊天记录',
    command: '根据聊天记录进行总结，保留关键信息，对每个主题进行总结',
    value: 'summary',
    context: true
  }
]
