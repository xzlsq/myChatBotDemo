import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { message } from '@/types'

type Conversations = {
  chatId: string,
  title: string,
  createAt: string,
  history: message[],
  customPromot: string
}

type ChatConfig = {
  model: string,
  temperature: number,
  top_p: number,
  max_tokens: number,
  presence_penalty: number,
  frequency_penalty: number
}

export const useChatStore = defineStore('chatRecord', () => {
  var conversations = ref<Conversations[]>([])
  var question = ref('')
  var chatConfig = ref<ChatConfig>({
    model: "deepseek-chat",
    temperature: 1,
    top_p: 1,
    max_tokens: 4096,
    presence_penalty: 0,
    frequency_penalty: 0,
  })
  var userConfig = ref({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-f0467fd3f70d4d2eb0fbdf49d67127bc',
  })

  // 记录某个对话的聊天上下文
  function addDialog(id: string, message: message) {
    var idx = conversations.value.findIndex(it => it.chatId == id)
    if (idx >= 0) {
      conversations.value[idx].history.push(message)
      localStorage.conversations = JSON.stringify(conversations.value)
    }
  }
  // 创建一个新对话
  function createConversation(promot: string = '') {
    var chatId = Math.random().toString(16).slice(2)
    conversations.value.unshift({
      chatId,
      title: '新的对话',
      createAt: Date.now().toString(),
      history: [],
      customPromot: promot
    })
    localStorage.conversations = JSON.stringify(conversations.value)
  }
  // 删除某个对话
  function deleteConversation(id: string) {
    var idx = conversations.value.findIndex(it => it.chatId == id)
    if (idx >= 0) {
      conversations.value.splice(idx, 1)
      localStorage.conversations = JSON.stringify(conversations.value)
    }
  }
  // 设置大模型参数
  function setChatConfig(option: keyof ChatConfig, value: ChatConfig[keyof ChatConfig]) {
    if (option && value) {
      if (typeof value == 'string' && option == 'model') {
        chatConfig.value[option] = value
      }
      localStorage.chatConfig = JSON.stringify(chatConfig.value)
    }
  }
  // 设置用户baseURL和apiKey
  function setUserConfig(option: keyof { baseURL: string, apiKey: string }, value: string) {
    if (option && value) {
      userConfig.value[option] = value
      localStorage.userConfig = JSON.stringify(userConfig.value)
    }
  }
  // 设置对话标题
  function setTitle(id: string, title: string) {
    var idx = conversations.value.findIndex(it => it.chatId == id)
    if (idx >= 0) {
      conversations.value[idx].title = title
      localStorage.conversations = JSON.stringify(conversations.value)
    }
  }
  function initChatStore() {
    let conversation: Conversations[] = []
    if (localStorage.conversations) {
      conversation = JSON.parse(localStorage.conversations) as Conversations[]
    } else {
      conversation = []
    }
    if (!localStorage.chatConfig) {
      localStorage.chatConfig = JSON.stringify(chatConfig.value)
    } else {
      chatConfig.value = JSON.parse(localStorage.chatConfig)
    }
    if (!localStorage.userConfig) {
      localStorage.userConfig = JSON.stringify(userConfig.value)
    } else {
      userConfig.value = JSON.parse(localStorage.userConfig)
    }
    conversations.value = conversation
  }
  if (conversations.value.length == 0) {
    initChatStore()
  }

  return {
    conversations,
    question,
    chatConfig,
    userConfig,
    addDialog,
    createConversation,
    deleteConversation,
    initChatStore,
    setChatConfig,
    setUserConfig,
    setTitle
  }

})

export const usePageStore = defineStore('PageConfig', () => {
  var fontSize = ref<number>(localStorage.fontSize ? Number(localStorage.fontSize) : 16)
  var historyMessage = ref<number>(localStorage.historyMessage ? Number(localStorage.historyMessage) : 4)
  var searchOn = ref<boolean>(false)
  var thinkOn = ref<boolean>(false)
  // var maskOn = ref<boolean>(false)

  function setFontSize(val: number) {
    fontSize.value = val
    localStorage.fontSize = val
    document.documentElement.style.setProperty('--font-size', (val + 'px'))
  }

  function setHistoryMessage(val: number) {
    historyMessage.value = val
    localStorage.historyMessage = val
  }

  function setSearchOn() {
    searchOn.value = !searchOn.value
  }

  function setThinkOn() {
    thinkOn.value = !thinkOn.value
  }

  return {
    fontSize,
    historyMessage,
    searchOn,
    thinkOn,
    setFontSize,
    setHistoryMessage,
    setSearchOn,
    setThinkOn
  }
})
