import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { message } from '@/types'

type Conversations = {
  chatId: string,
  title: string,
  createAt: string,
  history: message[]
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
  var chatConfig = ref({
    model: localStorage?.chatConfig?.model ?? "deepseek-chat",
    temperature: localStorage?.chatConfig?.temperature ?? 1,
    top_p: localStorage?.chatConfig?.top_p ?? 1,
    max_tokens: localStorage?.chatConfig?.max_tokens ?? 4096,
    presence_penalty: localStorage?.chatConfig?.presence_penalty ?? 0,
    frequency_penalty: localStorage?.chatConfig?.frequency_penalty ?? 0,
  })
  var userConfig = ref({
    baseURL: localStorage?.userConfig?.baseURL ?? 'https://api.deepseek.com',
    apiKey: localStorage?.userConfig?.apiKey ?? 'sk-f0467fd3f70d4d2eb0fbdf49d67127bc',
  })

  // 记录某个对话的聊天上下文
  function addDialog(id: string, message: message) {
    var idx = conversations.value.findIndex(it => it.chatId == id)
    if (idx >= 0) {
      // 是否是该聊天的首次对话
      if (conversations.value[idx].history.length == 0) {
        conversations.value[idx].title = message.content
      }
      conversations.value[idx].history.push(message)
      localStorage.conversations = JSON.stringify(conversations.value)
    }
  }
  // 创建一个新对话
  function createConversation() {
    conversations.value.unshift({
      chatId: Math.random().toString(16).slice(2),
      title: '新的对话',
      createAt: Date.now().toString(),
      history: []
    })
    localStorage.conversations = JSON.stringify(conversations.value)
  }
  // 设置大模型参数
  function setChatConfig(option: keyof ChatConfig, value: number | string) {
    if (option && value) {
      chatConfig.value[option] = value
      localStorage.chatConfig[option] = value
    }
  }
  // 设置用户baseURL和apiKey
  function setUserConfig(option: keyof {baseURL:string, apiKey: string}, value: number | string) {
    if (option && value) {
      userConfig.value[option] = value
      localStorage.userConfig[option] = value
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
      localStorage.chatConfig = chatConfig.value
    }
    if (!localStorage.userConfig) {
      localStorage.userConfig = userConfig.value
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
    initChatStore, 
    setChatConfig,
    setUserConfig
  }

})
