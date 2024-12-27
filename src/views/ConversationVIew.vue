<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { useChatStore } from '@/stores/ChatStore';
import { useRoute } from 'vue-router';
import { marked } from 'marked';

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

function sendQuestion(e: KeyboardEvent) {
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
        divRef.value!.innerHTML = divRef.value!.innerHTML + marked.parse(question.value)
        // console.log(chatCotext, ChatStore.conversations[idx.value].history)

        openai.chat.completions.create({
            messages: chatContext,
            model: "deepseek-chat",
        }).then((res) => {
            // console.log(res.choices[0])
            ChatStore.addDialog(route.params.chatId as string, {
                id: res.created.toString(),
                role: res.choices[0].message.role,
                content: res.choices[0].message.content ?? ''
            })
            
            divRef.value!.innerHTML = divRef.value!.innerHTML + marked.parse(res.choices[0].message.content ?? '')
        })

        question.value = ''
    }
}

onMounted(() => {
    if (ChatStore.conversations[idx.value].history.length > 0) {
        for (let chat of ChatStore.conversations[idx.value].history) {
            divRef.value!.innerHTML = divRef.value!.innerHTML + marked.parse(chat.content)
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
