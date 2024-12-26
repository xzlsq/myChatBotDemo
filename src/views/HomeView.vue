<script setup lang="ts">
import { useChatStore } from '@/stores/ChatStore';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
var ChatStore = useChatStore()
var router = useRouter()

onMounted(() => {
  ChatStore.initChatStore()
  ChatStore.createConversation()
  console.log(ChatStore.conversations)
  // router.replace(`/chat/${ChatStore.conversations[0].chatId}`)
})
</script>

<template>
  <div class="w-full h-full flex">
    <div name="对话记录" class="h-full w-[320px] shrink-0 bg-[#F0F4F9] flex flex-col items-center py-14 overflow-hidden gap-2">
      <div class="bg-gray-300 w-fit p-2 h-12 rounded-full flex items-center justify-center gap-2">
        <span>➕</span>发起新对话
      </div>
      <div class="w-full grow flex flex-col items-center overflow-auto gap-2">
        <RouterLink :to="`/chat/${chat.chatId}`" v-for="chat of ChatStore.conversations" class="w-[90%] rounded-lg bg-slate-300 p-2 truncate [&.router-link-exact-active]:bg-blue-300">
          {{ chat.title }}
        </RouterLink>
      </div>
    </div>
    <div name="输出框" class="grow overflow-hidden flex flex-col items-center">
      <RouterView></RouterView>
    </div>
  </div>
</template>
