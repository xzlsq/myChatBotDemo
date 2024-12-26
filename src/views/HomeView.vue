<script setup lang="ts">



</script>

<template>
  <div class="w-full h-full flex">
    <div name="对话记录" class="h-full w-[320px] shrink-0 bg-[#F0F4F9] flex flex-col items-center py-14 overflow-hidden gap-2">
      <div class="bg-gray-300 w-fit p-2 h-12 rounded-full flex items-center justify-center gap-2">
        <span>➕</span>发起新对话
      </div>
      <div class="w-full grow flex flex-col items-center overflow-auto">
        <RouterLink to="/chat/1" class="w-[90%] rounded-lg bg-slate-300 p-2 [&.router-link-exact-active]:bg-blue-300">
          新的对话
        </RouterLink>
      </div>
    </div>
    <div name="输出框" class="grow overflow-hidden flex flex-col items-center">
      <RouterView></RouterView>
    </div>
  </div>
</template>
