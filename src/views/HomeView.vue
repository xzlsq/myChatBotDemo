<script setup lang="ts">
import { useChatStore } from '@/stores/ChatStore';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resizeTextarea } from '@/hooks';

var ChatStore = useChatStore()
var router = useRouter()
var route = useRoute()

// 通过输入框创建新的对话
function createNewConversation(e: KeyboardEvent) {
  if (e.code == 'Enter' && !e.shiftKey) {
    if (ChatStore.question.length == 0) {
      return
    }
    ChatStore.createConversation()
    router.replace(`/chat/${ChatStore.conversations[0].chatId}`)
  }
}
// 手动点击按钮创建新的对话
function createNewConversation2() {
  ChatStore.createConversation()
  router.replace(`/chat/${ChatStore.conversations[0].chatId}`)
}

onMounted(() => {
  ChatStore.initChatStore()
})
</script>

<template>
  <div class="w-full h-full flex">
    <div name="对话记录"
      class="h-full w-[320px] shrink-0 bg-[#F0F4F9] flex flex-col items-center py-14 overflow-hidden gap-2">
      <button @click="createNewConversation2"
        class="bg-gray-300 w-fit px-4 py-2 h-12 rounded-full flex items-center justify-center gap-2">
        <span>➕</span>发起新对话
      </button>
      <div class="w-full grow flex flex-col items-center overflow-auto gap-2">
        <RouterLink :to="`/chat/${chat.chatId}`" v-for="chat of ChatStore.conversations"
          class="w-[90%] rounded-lg bg-slate-300 p-2 truncate [&.router-link-exact-active]:bg-blue-300">
          {{ chat.title }}
        </RouterLink>
      </div>
      <button @click="router.push('/setting')" class="bg-gray-300 w-fit px-4 py-2 h-12 rounded-full flex items-center justify-center gap-2">
        <span>⚙️</span>设置
      </button>
    </div>
    <div name="输出框" class="grow overflow-hidden flex flex-col items-center justify-center">
      <RouterView></RouterView>
      <div name="输入框" v-if="route.fullPath == '/'" class="w-[80%] h-16 px-4 py-2 border border-gray-400
        rounded flex justify-center items-center">
        <textarea @input="(e) => resizeTextarea(e)" autofocus v-model="ChatStore.question"
          class="w-full box-border h-fit resize-none outline-none overflow-hidden"
          placeholder="问一问... | 按下Shift+Enter换行 | 按下Enter发送"
          @keypress="(e) => createNewConversation(e)"></textarea>
      </div>
    </div>
  </div>
</template>
