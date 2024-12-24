<script setup lang="ts">
import { onMounted, ref } from 'vue'
import OpenAI from "openai";
var chatContent = ref<string | null>('')
var question = ref<string>('')

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-f0467fd3f70d4d2eb0fbdf49d67127bc',
  dangerouslyAllowBrowser: true
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-chat",
  });

  chatContent.value = completion.choices[0].message.content
  // console.log(completion.choices[0].message.content);
}

function resizeTextarea(e: any) {
  var textarea = e.target
  // console.log(textarea.scrollHeight)
  if (textarea.scrollHeight <= 200) {
    textarea.classList.add('overflow-hidden')
    textarea.classList.remove('overflow-auto')
    textarea.style.height = 'auto'; // 先重置高度
    textarea.style.height = (textarea.scrollHeight) + 'px';
  } else {
    textarea.classList.remove('overflow-hidden')
    textarea.classList.add('overflow-auto')
  }
}

function sendQuestion(e: KeyboardEvent) {
  if (e.code == 'Enter' && !e.shiftKey) {
    e.preventDefault()
  }
}

main()

</script>

<template>
  <div class="w-full h-full flex">
    <div class="h-full w-[320px] shrink-0 bg-[#F0F4F9]">

    </div>
    <div class="grow overflow-hidden flex flex-col items-center">
      <div class="grow w-full mt-14 px-8 pt-4 pb-2 ">
        {{ chatContent }}
      </div>
      <div class="w-[80%] min-h-16 px-4 py-2 border border-gray-400 bottom-14 
      rounded flex justify-center items-center mb-14">
        <textarea @input="(e) => resizeTextarea(e)" v-model="question"
          class="w-full box-border h-fit resize-none outline-none overflow-hidden"
          placeholder="问一问... | 按下Shift+Enter换行 | 按下Enter发送" @keypress="(e) => sendQuestion(e)"></textarea>
      </div>
    </div>
  </div>
</template>
