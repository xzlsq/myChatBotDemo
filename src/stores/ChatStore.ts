import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { message } from '@/types'

type Conversations = {
  chatId: string,
  title: string,
  createAt: string,
  history: message[]
}

export const useChatStore = defineStore('chatRecord', () => {
  var conversations = ref<Conversations[]>([])

  // 记录某个对话的聊天上下文
  function addDialog(id: string, message: message) {
    var idx =  conversations.value.findIndex(it => it.chatId == id)
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

  function initChatStore() {
    let conversation: Conversations[] = []
    if (localStorage.conversations) {
      conversation = JSON.parse(localStorage.conversations) as Conversations[]
    } else {
      conversation = []
    }
    conversations.value = conversation
  }

  return {conversations, addDialog, createConversation, initChatStore}

})
