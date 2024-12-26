import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { message } from '@/types'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

type Conversations = {
  chatId: string,
  history: message[]
}

var history: Conversations[] = []

if (localStorage.conversations) {
  history = JSON.parse(localStorage.conversations) as Conversations[]
} else {
  history = []
}
const useChatStore = defineStore('chatRecord', () => {
  var conversations = ref<Conversations[]>(history)

  // 记录某个对话的聊天上下文
  function addDialog(id: string, message: message) {
    var idx =  conversations.value.findIndex(it => it.chatId == id)
    if (idx >= 0) {
      conversations.value[idx].history.push(message)
    }
  }
  // 创建一个新对话
  function createConversation() {
    conversations.value.push({
      chatId: Math.random().toString(16),
      history: []
    })
  }

  return {conversations, addDialog, createConversation}

})
