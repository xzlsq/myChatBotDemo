<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { useChatStore } from '@/stores/ChatStore';
import { useRoute } from 'vue-router';
import { marked } from 'marked';
import { integrateToMd } from '@/parseMd';

var ChatStore = useChatStore()
var route = useRoute()
var question = ref<string>('')
var idx = computed(() => ChatStore.conversations.findIndex(it => it.chatId == route.params.chatId))
var divRef = useTemplateRef('output')

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-f0467fd3f70d4d2eb0fbdf49d67127bc',
    dangerouslyAllowBrowser: true
});

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

async function sendQuestion(e: KeyboardEvent) {
    // 按下回车开始请求
    if (e.code == 'Enter' && !e.shiftKey) {
        e.preventDefault()

        ChatStore.addDialog(route.params.chatId as string, {
            id: Date.now().toString(),
            role: "user",
            content: question.value
        })
        var chatContext: ChatCompletionMessageParam[] = ChatStore.conversations[idx.value].history.map((it) => {
            return { role: it.role, content: it.content } as ChatCompletionMessageParam
        })

        divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="user w-full space-y-2">${marked.parse(question.value)}</div>`
        // 当出现滚动条时，有新内容添加时则自动滚动到新内容处
        divRef.value!.lastElementChild!.scrollIntoView({
            block: 'end',
            behavior: 'smooth'
        })

        question.value = ''

        var resStream = await openai.chat.completions.create({
            messages: chatContext,
            model: "deepseek-chat",
            stream: true,
        })

        // 创建一个class="system w-full space-y-2"的div，用于显示completions
        var systemDiv = document.createElement('div')
        systemDiv.classList.add('system', 'w-full', 'space-y-2')
        divRef.value!.appendChild(systemDiv)
        var res = await integrateToMd(resStream, systemDiv)

        ChatStore.addDialog(route.params.chatId as string,  {
            id: Date.now().toString(),
            role: res[0].role,
            content: res[0].content
        })

        // divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="system w-full space-y-2">${marked.parse(res[0].content)}</div>`
        // 当出现滚动条时，有新内容添加时则自动滚动到新内容处
        divRef.value!.lastElementChild!.scrollIntoView({
            block: 'end',
            behavior: 'smooth'
        })
    }
}

watch(idx, () => {
    divRef.value!.innerHTML = ''
    for (let chat of ChatStore.conversations[idx.value].history) {
        if (chat.role == 'user') {
            divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="user w-full space-y-2">${marked.parse(chat.content)}</div>`
        } else {
            divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="system w-full space-y-2">${marked.parse(chat.content)}</div>`
        }
    }

})

onMounted(() => {
    divRef.value!.innerHTML = ''
    for (let chat of ChatStore.conversations[idx.value].history) {
        if (chat.role == 'user') {
            divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="user w-full space-y-2">${marked.parse(chat.content)}</div>`
        } else {
            divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="system w-full space-y-2">${marked.parse(chat.content)}</div>`
        }
    }
})

</script>

<template>
    <div name="输出框" class="w-full h-full overflow-hidden flex flex-col items-center">
        <div class="w-full h-14 shrink-0 flex items-center justify-center text-2xl border-b border-black">
            <div class="max-w-[200px] truncate">
                {{ ChatStore.conversations[idx].title }}
            </div>
        </div>
        <div ref="output" class="grow w-full px-8 pt-4 pb-2 overflow-auto space-y-4">

        </div>
        <div name="输入框" class="w-[80%] min-h-16 px-4 py-2 border shrink-0 border-gray-400 bottom-14 
      rounded flex justify-center items-center mb-14">
            <textarea @input="(e) => resizeTextarea(e)" v-model="question"
                class="w-full box-border h-fit resize-none outline-none overflow-hidden"
                placeholder="问一问... | 按下Shift+Enter换行 | 按下Enter发送" @keypress="(e) => sendQuestion(e)"></textarea>
        </div>
    </div>
</template>
